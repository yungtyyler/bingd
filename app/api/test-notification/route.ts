import {
  PushProvider,
  PushSubscriptionStatus,
} from "@/app/generated/prisma/enums";
import { ensureDbUser } from "@/lib/ensure-user";
import { sendApnsNotification } from "@/lib/apns-push";
import prisma from "@/lib/prisma";
import {
  configureWebPush,
  sendWebPushNotification,
} from "@/lib/web-push";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SendTarget = {
  provider: PushProvider;
  send: () => Promise<void>;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST() {
  let dbUser;

  try {
    dbUser = await ensureDbUser();
  } catch {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: dbUser.id,
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
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { success: false, error: "No active devices found." },
      { status: 400 },
    );
  }

  if (
    subscriptions.some(
      (subscription) => subscription.provider === PushProvider.WEB_PUSH,
    )
  ) {
    configureWebPush();
  }

  const payload = {
    title: "bingd. alerts are ready",
    body: "This device is set up for show notifications.",
    url: "/settings",
  };

  const sendTargets: SendTarget[] = subscriptions.map((subscription) => {
    if (subscription.provider === PushProvider.APNS) {
      return {
        provider: PushProvider.APNS,
        send: () => sendApnsNotification({ subscription, payload }),
      };
    }

    return {
      provider: PushProvider.WEB_PUSH,
      send: () => sendWebPushNotification({ subscription, payload }),
    };
  });

  const results = await Promise.allSettled(
    sendTargets.map((target) => target.send()),
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;
  const byProvider = sendTargets.reduce(
    (summary, target, index) => {
      const result = results[index];
      const providerSummary = summary[target.provider];

      providerSummary.total++;

      if (result.status === "fulfilled") {
        providerSummary.sent++;
      } else {
        providerSummary.failed++;
        console.error(
          `[test-notification] ${target.provider} send failed: ${getErrorMessage(result.reason)}`,
        );
      }

      return summary;
    },
    {
      [PushProvider.APNS]: { total: 0, sent: 0, failed: 0 },
      [PushProvider.FCM]: { total: 0, sent: 0, failed: 0 },
      [PushProvider.WEB_PUSH]: { total: 0, sent: 0, failed: 0 },
    },
  );

  if (sent === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Could not send to any active devices.",
        sent,
        failed,
        byProvider,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    sent,
    failed,
    byProvider,
  });
}
