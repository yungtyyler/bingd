import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function readJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isDryRun = request.nextUrl.searchParams.get("dryRun") === "true";

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const origin =
    process.env.BASE_ADDRESS?.replace(/\/$/, "") || request.nextUrl.origin;
  const headers = { authorization: `Bearer ${cronSecret}` };

  if (isDryRun) {
    const notificationResponse = await fetch(
      `${origin}/api/send-notifications?dryRun=true`,
      { headers, cache: "no-store" },
    );
    const notificationResult = await readJson(notificationResponse);

    return NextResponse.json(
      {
        success: notificationResponse.ok,
        dryRun: true,
        sync: { skipped: true },
        notifications: {
          status: notificationResponse.status,
          result: notificationResult,
        },
      },
      { status: notificationResponse.ok ? 200 : 502 },
    );
  }

  const syncResponse = await fetch(`${origin}/api/sync-shows`, {
    headers,
    cache: "no-store",
  });
  const syncResult = await readJson(syncResponse);

  if (!syncResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "Daily cron sync step failed.",
        sync: {
          status: syncResponse.status,
          result: syncResult,
        },
      },
      { status: 502 },
    );
  }

  const notificationResponse = await fetch(`${origin}/api/send-notifications`, {
    headers,
    cache: "no-store",
  });
  const notificationResult = await readJson(notificationResponse);

  return NextResponse.json(
    {
      success: notificationResponse.ok,
      sync: {
        status: syncResponse.status,
        result: syncResult,
      },
      notifications: {
        status: notificationResponse.status,
        result: notificationResult,
      },
    },
    { status: notificationResponse.ok ? 200 : 502 },
  );
}
