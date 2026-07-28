import { PushSubscriptionStatus } from "@/app/generated/prisma/enums";
import type { PushSubscription } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { randomUUID, sign } from "node:crypto";
import http2 from "node:http2";

type PushPayload = {
  title: string;
  body: string;
  url: string;
};

type SendableApnsSubscription = Pick<PushSubscription, "id" | "token">;

type ApnsError = {
  reason?: string;
  timestamp?: number;
};

let cachedAuthToken: { value: string; issuedAt: number } | null = null;

function base64Url(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getApnsConfig() {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const bundleId = process.env.APNS_BUNDLE_ID || "com.getbingd.app";
  const environment = process.env.APNS_ENVIRONMENT;

  if (!keyId || !teamId || !privateKey) {
    return null;
  }

  return {
    keyId,
    teamId,
    privateKey,
    bundleId,
    host:
      environment === "sandbox"
        ? "https://api.sandbox.push.apple.com"
        : "https://api.push.apple.com",
  };
}

export function isApnsConfigured() {
  return !!getApnsConfig();
}

function getProviderToken() {
  const config = getApnsConfig();

  if (!config) {
    throw new Error("APNs credentials are not configured.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);

  if (cachedAuthToken && issuedAt - cachedAuthToken.issuedAt < 50 * 60) {
    return cachedAuthToken.value;
  }

  const header = base64Url(
    JSON.stringify({
      alg: "ES256",
      kid: config.keyId,
    }),
  );
  const claims = base64Url(
    JSON.stringify({
      iss: config.teamId,
      iat: issuedAt,
    }),
  );
  const unsignedToken = `${header}.${claims}`;
  const signature = sign("sha256", Buffer.from(unsignedToken), {
    key: config.privateKey,
    dsaEncoding: "ieee-p1363",
  });

  cachedAuthToken = {
    value: `${unsignedToken}.${base64Url(signature)}`,
    issuedAt,
  };

  return cachedAuthToken.value;
}

function shouldExpireSubscription(statusCode: number, reason?: string) {
  return statusCode === 410 || reason === "Unregistered";
}

export async function sendApnsNotification({
  subscription,
  payload,
}: {
  subscription: SendableApnsSubscription;
  payload: PushPayload;
}) {
  const config = getApnsConfig();

  if (!config) {
    throw new Error("APNs credentials are not configured.");
  }

  if (!subscription.token) {
    throw new Error("Push subscription is missing an APNs token.");
  }

  const requestBody = JSON.stringify({
    aps: {
      alert: {
        title: payload.title,
        body: payload.body,
      },
      sound: "default",
    },
    url: payload.url,
  });

  const status = await new Promise<{
    statusCode: number;
    body: ApnsError | null;
  }>((resolve, reject) => {
    const client = http2.connect(config.host);
    const chunks: Buffer[] = [];

    client.on("error", reject);

    const request = client.request({
      ":method": "POST",
      ":path": `/3/device/${subscription.token}`,
      authorization: `bearer ${getProviderToken()}`,
      "apns-id": randomUUID(),
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-topic": config.bundleId,
    });

    request.setEncoding("utf8");
    request.on("response", (headers) => {
      request.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      request.on("end", () => {
        client.close();
        const statusCode = Number(headers[":status"] || 0);
        const bodyText = Buffer.concat(chunks).toString("utf8");

        resolve({
          statusCode,
          body: bodyText ? (JSON.parse(bodyText) as ApnsError) : null,
        });
      });
    });
    request.on("error", (error) => {
      client.close();
      reject(error);
    });
    request.end(requestBody);
  });

  if (status.statusCode >= 200 && status.statusCode < 300) {
    return;
  }

  if (shouldExpireSubscription(status.statusCode, status.body?.reason)) {
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

  throw new Error(
    `APNs send failed with ${status.statusCode}${
      status.body?.reason ? `: ${status.body.reason}` : ""
    }`,
  );
}
