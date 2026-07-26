"use client";

import { BellRing } from "lucide-react";
import { useState } from "react";

type Status = {
  type: "success" | "error";
  message: string;
} | null;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function WebPushSubscriptionButton() {
  const [status, setStatus] = useState<Status>(null);
  const [isPending, setIsPending] = useState(false);

  const handleEnablePush = async () => {
    setStatus(null);
    setIsPending(true);

    try {
      const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Push public key is not configured.");
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications are not supported here.");
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      await navigator.serviceWorker.register("/sw.js");
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const response = await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error("Could not save this device.");
      }

      setStatus({
        type: "success",
        message: "This device is ready for alerts.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not enable alerts.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-surface-border pt-4">
      <button
        type="button"
        onClick={handleEnablePush}
        disabled={isPending}
        className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand-primary/40 bg-brand-primary/10 px-4 py-2 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <BellRing className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Enabling..." : "Enable This Device"}
      </button>

      {status && (
        <div
          className={`p-3 rounded-md text-sm font-bold border ${
            status.type === "success"
              ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
