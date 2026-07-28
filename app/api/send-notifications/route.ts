import {
  NotificationStatus,
  NotificationType,
  PushProvider,
  PushSubscriptionStatus,
  WatchStatus,
} from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { sendApnsNotification } from "@/lib/apns-push";
import prisma from "@/lib/prisma";
import {
  configureWebPush,
  sendWebPushNotification,
} from "@/lib/web-push";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
const fallbackTimezone = "America/Los_Angeles";

function getSafeTimezone(timezone: string | null) {
  if (!timezone) {
    return { timezone: fallbackTimezone, usedFallback: false };
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return { timezone, usedFallback: false };
  } catch {
    return { timezone: fallbackTimezone, usedFallback: true };
  }
}

function getDateKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isSameLocalDay(a: Date, b: Date, timezone: string) {
  return getDateKey(a, timezone) === getDateKey(b, timezone);
}

function getEventKey(show: {
  tvmazeId: number;
  nextEpisodeDate: Date | null;
  nextEpisodeTvmazeId: number | null;
}) {
  if (show.nextEpisodeTvmazeId) {
    return String(show.nextEpisodeTvmazeId);
  }

  return `${show.tvmazeId}:${show.nextEpisodeDate?.toISOString() || "unknown"}`;
}

function getNotificationType({
  isAiringTonight,
  isNewSeason,
  preferences,
}: {
  isAiringTonight: boolean;
  isNewSeason: boolean;
  preferences: {
    airingTonightEnabled: boolean;
    airingThisWeekEnabled: boolean;
    newSeasonThisWeekEnabled: boolean;
  };
}) {
  if (isNewSeason && preferences.newSeasonThisWeekEnabled) {
    return NotificationType.NEW_SEASON_THIS_WEEK;
  }

  if (isAiringTonight && preferences.airingTonightEnabled) {
    return NotificationType.AIRING_TONIGHT;
  }

  if (preferences.airingThisWeekEnabled) {
    return NotificationType.AIRING_THIS_WEEK;
  }

  return null;
}

function getNotificationCopy({
  showName,
  type,
  airTimeLabel,
}: {
  showName: string;
  type: NotificationType;
  airTimeLabel: string;
}) {
  switch (type) {
    case NotificationType.NEW_SEASON_THIS_WEEK:
      return {
        title: `${showName} starts a new season`,
        body: `New season starts ${airTimeLabel}. Tap to view it in bingd.`,
      };
    case NotificationType.AIRING_TONIGHT:
      return {
        title: `${showName} airs tonight`,
        body: `New episode airs ${airTimeLabel}. Tap to view it in bingd.`,
      };
    case NotificationType.AIRING_THIS_WEEK:
      return {
        title: `${showName} has a new episode this week`,
        body: `New episode airs ${airTimeLabel}. Tap to view it in bingd.`,
      };
  }
}

function getAirTimeLabel({
  date,
  timezone,
  isAiringTonight,
}: {
  date: Date;
  timezone: string;
  isAiringTonight: boolean;
}) {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);

  if (isAiringTonight) {
    return `tonight at ${time}`;
  }

  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);

  return `${day} at ${time}`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isDryRun = request.nextUrl.searchParams.get("dryRun") === "true";

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isDryRun) {
    configureWebPush();
  }

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + oneWeekInMs);
  const trackedShows = await prisma.userShow.findMany({
    where: {
      status: { in: [WatchStatus.WATCHING, WatchStatus.PLANNED] },
      show: {
        nextEpisodeDate: {
          gte: now,
          lte: weekFromNow,
        },
      },
      user: {
        notificationPreference: {
          pushEnabled: true,
        },
        pushSubscriptions: {
          some: {
            status: PushSubscriptionStatus.ACTIVE,
            OR: [
              {
                provider: PushProvider.WEB_PUSH,
                endpoint: { not: null },
                p256dh: { not: null },
                auth: { not: null },
              },
              {
                provider: PushProvider.APNS,
                token: { not: null },
              },
            ],
          },
        },
      },
    },
    include: {
      show: true,
      user: {
        include: {
          notificationPreference: true,
          pushSubscriptions: {
            where: {
              status: PushSubscriptionStatus.ACTIVE,
              OR: [
                {
                  provider: PushProvider.WEB_PUSH,
                  endpoint: { not: null },
                  p256dh: { not: null },
                  auth: { not: null },
                },
                {
                  provider: PushProvider.APNS,
                  token: { not: null },
                },
              ],
            },
          },
        },
      },
    },
  });

  let sentCount = 0;
  let eligibleCount = 0;
  let failedCount = 0;
  const skipped = {
    missingData: 0,
    preferenceDisabled: 0,
    dryRun: 0,
    duplicate: 0,
    invalidTimezone: 0,
  };

  for (const trackedShow of trackedShows) {
    if (!trackedShow.user || !trackedShow.show) {
      skipped.missingData++;
      continue;
    }

    const user = trackedShow.user;
    const show = trackedShow.show;
    const preferences = user.notificationPreference;
    const nextEpisodeDate = show.nextEpisodeDate;

    if (!preferences || !nextEpisodeDate) {
      skipped.missingData++;
      continue;
    }

    const { timezone, usedFallback } = getSafeTimezone(preferences.timezone);

    if (usedFallback) {
      skipped.invalidTimezone++;
    }

    const isAiringTonight = isSameLocalDay(nextEpisodeDate, now, timezone);
    const type = getNotificationType({
      isAiringTonight,
      isNewSeason: show.nextEpisodeNumber === 1,
      preferences,
    });

    if (!type) {
      skipped.preferenceDisabled++;
      continue;
    }

    const eventKey = getEventKey(show);
    const copy = getNotificationCopy({
      showName: show.name,
      type,
      airTimeLabel: getAirTimeLabel({
        date: nextEpisodeDate,
        timezone,
        isAiringTonight,
      }),
    });
    eligibleCount++;

    if (isDryRun) {
      skipped.dryRun++;
      continue;
    }

    let log;

    try {
      log = await prisma.notificationLog.create({
        data: {
          userId: trackedShow.userId,
          showId: trackedShow.showId,
          type,
          status: NotificationStatus.PENDING,
          eventKey,
          scheduledFor: now,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        skipped.duplicate++;
        continue;
      }

      throw error;
    }

    const sendResults = await Promise.allSettled(
      user.pushSubscriptions.map((subscription) => {
        const payload = {
          title: copy.title,
          body: copy.body,
          url: `/shows/${show.tvmazeId}`,
        };

        if (subscription.provider === PushProvider.APNS) {
          return sendApnsNotification({ subscription, payload });
        }

        return sendWebPushNotification({ subscription, payload });
      }),
    );

    const successfulSends = sendResults.filter(
      (result) => result.status === "fulfilled",
    ).length;

    if (successfulSends > 0) {
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
      sentCount++;
    } else {
      await prisma.notificationLog.update({
        where: { id: log.id },
        data: {
          status: NotificationStatus.FAILED,
          failedAt: new Date(),
          failureReason: "All push subscriptions failed.",
        },
      });
      failedCount++;
    }
  }

  return NextResponse.json({
    success: true,
    dryRun: isDryRun,
    checked: trackedShows.length,
    eligible: eligibleCount,
    sent: sentCount,
    skipped,
    failed: failedCount,
  });
}
