import {
  NotificationStatus,
  NotificationType,
  PushSubscriptionStatus,
  WatchStatus,
} from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
import { NextRequest, NextResponse } from "next/server";
import webPush, { PushSubscription as WebPushSubscription } from "web-push";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

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
  episodeName,
  type,
}: {
  showName: string;
  episodeName: string | null;
  type: NotificationType;
}) {
  const episodeSuffix = episodeName ? `: ${episodeName}` : "";

  switch (type) {
    case NotificationType.NEW_SEASON_THIS_WEEK:
      return {
        title: `${showName} starts a new season this week`,
        body: `A new season is almost here${episodeSuffix}.`,
      };
    case NotificationType.AIRING_TONIGHT:
      return {
        title: `${showName} airs tonight`,
        body: `A new episode is airing tonight${episodeSuffix}.`,
      };
    case NotificationType.AIRING_THIS_WEEK:
      return {
        title: `${showName} airs this week`,
        body: `A new episode is coming up${episodeSuffix}.`,
      };
  }
}

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("Web push VAPID keys are not configured.");
  }

  webPush.setVapidDetails(
    process.env.WEB_PUSH_CONTACT || SITE_URL,
    publicKey,
    privateKey,
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  configureWebPush();

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
            endpoint: { not: null },
            p256dh: { not: null },
            auth: { not: null },
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
              endpoint: { not: null },
              p256dh: { not: null },
              auth: { not: null },
            },
          },
        },
      },
    },
  });

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const trackedShow of trackedShows) {
    if (!trackedShow.user || !trackedShow.show) {
      skippedCount++;
      continue;
    }

    const preferences = trackedShow.user.notificationPreference;
    const nextEpisodeDate = trackedShow.show.nextEpisodeDate;

    if (!preferences || !nextEpisodeDate) {
      skippedCount++;
      continue;
    }

    const timezone = preferences.timezone || "America/Los_Angeles";
    const type = getNotificationType({
      isAiringTonight: isSameLocalDay(nextEpisodeDate, now, timezone),
      isNewSeason: trackedShow.show.nextEpisodeNumber === 1,
      preferences,
    });

    if (!type) {
      skippedCount++;
      continue;
    }

    const eventKey = getEventKey(trackedShow.show);
    const copy = getNotificationCopy({
      showName: trackedShow.show.name,
      episodeName: trackedShow.show.nextEpisodeName,
      type,
    });

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
        skippedCount++;
        continue;
      }

      throw error;
    }

    const payload = JSON.stringify({
      title: copy.title,
      body: copy.body,
      url: `/shows/${trackedShow.show.tvmazeId}`,
    });

    const sendResults = await Promise.allSettled(
      trackedShow.user.pushSubscriptions.map(async (subscription) => {
        const pushSubscription: WebPushSubscription = {
          endpoint: subscription.endpoint!,
          keys: {
            p256dh: subscription.p256dh!,
            auth: subscription.auth!,
          },
        };

        try {
          await webPush.sendNotification(pushSubscription, payload);
        } catch (error) {
          const statusCode =
            typeof error === "object" &&
            error !== null &&
            "statusCode" in error
              ? error.statusCode
              : null;

          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: {
                status: PushSubscriptionStatus.EXPIRED,
                disabledAt: new Date(),
              },
            });
          } else {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { failureCount: { increment: 1 } },
            });
          }

          throw error;
        }
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
    checked: trackedShows.length,
    sent: sentCount,
    skipped: skippedCount,
    failed: failedCount,
  });
}
