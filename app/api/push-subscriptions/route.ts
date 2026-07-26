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
  timezone?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
};

function normalizeTimezone(timezone: unknown) {
  if (typeof timezone !== "string" || timezone.trim().length === 0) {
    return null;
  }

  const value = timezone.trim();

  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return null;
  }
}

async function getDbUserOrUnauthorized() {
  try {
    return { dbUser: await ensureDbUser(), response: null };
  } catch {
    return {
      dbUser: null,
      response: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }
}

export async function POST(request: NextRequest) {
  const { dbUser, response } = await getDbUserOrUnauthorized();

  if (!dbUser) {
    return response;
  }

  const body = (await request.json()) as WebPushSubscriptionBody;
  const timezone = normalizeTimezone(body.timezone);

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

  await prisma.notificationPreference.upsert({
    where: { userId: dbUser.id },
    update: {
      pushEnabled: true,
      ...(timezone ? { timezone } : {}),
    },
    create: {
      userId: dbUser.id,
      pushEnabled: true,
      timezone,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { dbUser, response } = await getDbUserOrUnauthorized();

  if (!dbUser) {
    return response;
  }

  const body = (await request.json()) as { endpoint?: unknown };

  if (typeof body.endpoint !== "string") {
    return NextResponse.json(
      { success: false, error: "Invalid push subscription." },
      { status: 400 },
    );
  }

  await prisma.pushSubscription.updateMany({
    where: {
      userId: dbUser.id,
      endpoint: body.endpoint,
    },
    data: {
      status: PushSubscriptionStatus.DISABLED,
      disabledAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
