"use client";

import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration(
        "/sw.js",
      );
      const subscription = await registration?.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    };

    void checkSubscription();
  }, []);

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
      setIsSubscribed(true);
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

  const handleDisablePush = async () => {
    setStatus(null);
    setIsPending(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration(
        "/sw.js",
      );
      const subscription = await registration?.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        setStatus({
          type: "success",
          message: "This device is not subscribed.",
        });
        return;
      }

      const response = await fetch("/api/push-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      if (!response.ok) {
        throw new Error("Could not disable this device.");
      }

      await subscription.unsubscribe();
      setIsSubscribed(false);
      setStatus({
        type: "success",
        message: "This device will no longer receive alerts.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not disable this device.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-surface-border pt-4">
      <button
        type="button"
        onClick={isSubscribed ? handleDisablePush : handleEnablePush}
        disabled={isPending}
        className={`flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isSubscribed
            ? "border-surface-border bg-surface-base text-white hover:border-red-500/50 hover:text-red-400"
            : "border-brand-primary/40 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15"
        }`}
      >
        {isSubscribed ? (
          <BellOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <BellRing className="h-4 w-4" aria-hidden="true" />
        )}
        {isPending
          ? "Saving..."
          : isSubscribed
            ? "Disable This Device"
            : "Enable This Device"}
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
