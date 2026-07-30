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

  const results = await Promise.allSettled(
    subscriptions.map((subscription) => {
      const payload = {
        title: "bingd. alerts are ready",
        body: "This device is set up for show notifications.",
        url: "/settings",
      };

      if (subscription.provider === PushProvider.APNS) {
        return sendApnsNotification({ subscription, payload });
      }

      return sendWebPushNotification({ subscription, payload });
    }),
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;

  if (sent === 0) {
    return NextResponse.json(
      { success: false, error: "Could not send to any active devices." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, sent });
}
