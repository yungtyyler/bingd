import { PushSubscriptionStatus } from "@/app/generated/prisma/enums";
import type { PushSubscription } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
import webPush, { PushSubscription as WebPushSubscription } from "web-push";

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

type SendablePushSubscription = Pick<
  PushSubscription,
  "id" | "endpoint" | "p256dh" | "auth"
>;

export function configureWebPush() {
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

export async function sendWebPushNotification({
  subscription,
  payload,
}: {
  subscription: SendablePushSubscription;
  payload: PushPayload;
}) {
  if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
    throw new Error("Push subscription is missing required web push keys.");
  }

  const pushSubscription: WebPushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await webPush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
    );
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
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
}
