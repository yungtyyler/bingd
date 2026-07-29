import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HealthCheck = {
  name: string;
  ok: boolean;
};

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { name: "database", ok: true };
  } catch (error) {
    console.error("Health check database error:", error);
    return { name: "database", ok: false };
  }
}

function getConfigChecks(): HealthCheck[] {
  return [
    { name: "baseAddress", ok: Boolean(process.env.BASE_ADDRESS) },
    { name: "databaseUrl", ok: Boolean(process.env.DATABASE_URL) },
    {
      name: "clerkPublishableKey",
      ok: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    },
    { name: "clerkSecretKey", ok: Boolean(process.env.CLERK_SECRET_KEY) },
    { name: "cronSecret", ok: Boolean(process.env.CRON_SECRET) },
    {
      name: "webPushPublicKey",
      ok: Boolean(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY),
    },
    { name: "webPushPrivateKey", ok: Boolean(process.env.WEB_PUSH_PRIVATE_KEY) },
    { name: "apnsKeyId", ok: Boolean(process.env.APNS_KEY_ID) },
    { name: "apnsTeamId", ok: Boolean(process.env.APNS_TEAM_ID) },
    { name: "apnsPrivateKey", ok: Boolean(process.env.APNS_PRIVATE_KEY) },
    { name: "apnsBundleId", ok: Boolean(process.env.APNS_BUNDLE_ID) },
    { name: "apnsEnvironment", ok: Boolean(process.env.APNS_ENVIRONMENT) },
  ];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const includeDetails =
    Boolean(process.env.CRON_SECRET) &&
    authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const checks = [await checkDatabase()];

  if (includeDetails) {
    checks.push(...getConfigChecks());
  }

  const success = checks.every((check) => check.ok);

  return NextResponse.json(
    {
      success,
      status: success ? "ok" : "degraded",
      checkedAt: new Date().toISOString(),
      ...(includeDetails ? { checks } : {}),
    },
    { status: success ? 200 : 503 },
  );
}
