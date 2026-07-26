import {
  PushPlatform,
  PushProvider,
  PushSubscriptionStatus,
} from "@/app/generated/prisma/enums";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type WebPushSubscriptionBody = {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

export async function POST(request: NextRequest) {
  const dbUser = await ensureDbUser();
  const body = (await request.json()) as WebPushSubscriptionBody;

  if (
    typeof body.endpoint !== "string" ||
    typeof body.keys?.p256dh !== "string" ||
    typeof body.keys?.auth !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid push subscription." },
      { status: 400 },
    );
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    update: {
      userId: dbUser.id,
      platform: PushPlatform.WEB,
      provider: PushProvider.WEB_PUSH,
      status: PushSubscriptionStatus.ACTIVE,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: request.headers.get("user-agent"),
      lastSeenAt: new Date(),
      disabledAt: null,
      failureCount: 0,
    },
    create: {
      userId: dbUser.id,
      platform: PushPlatform.WEB,
      provider: PushProvider.WEB_PUSH,
      status: PushSubscriptionStatus.ACTIVE,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: request.headers.get("user-agent"),
      lastSeenAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
