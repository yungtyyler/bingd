"use client";

import { BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

const nativeTokenStorageKey = "bingd:native-push-token";

type Status = {
  type: "success" | "error";
  message: string;
} | null;

type DeviceMode = "web" | "native";
type NativePlatform = "IOS" | "ANDROID";

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
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("web");

  useEffect(() => {
    const checkSubscription = async () => {
      const { Capacitor } = await import("@capacitor/core");

      if (Capacitor.isNativePlatform()) {
        setDeviceMode("native");
        setIsSubscribed(!!window.localStorage.getItem(nativeTokenStorageKey));
        return;
      }

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

  const handleEnableNativePush = async () => {
    const [{ Capacitor }, { PushNotifications }] = await Promise.all([
      import("@capacitor/core"),
      import("@capacitor/push-notifications"),
    ]);

    const capacitorPlatform = Capacitor.getPlatform();
    const platform: NativePlatform | null =
      capacitorPlatform === "ios"
        ? "IOS"
        : capacitorPlatform === "android"
          ? "ANDROID"
          : null;

    if (!platform || !Capacitor.isNativePlatform()) {
      throw new Error("Native notifications are not available here.");
    }

    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== "granted") {
      throw new Error("Notification permission was not granted.");
    }

    let registrationHandle:
      | Awaited<ReturnType<typeof PushNotifications.addListener>>
      | undefined;
    let registrationErrorHandle:
      | Awaited<ReturnType<typeof PushNotifications.addListener>>
      | undefined;

    const token = await new Promise<string>((resolve, reject) => {
      let isSettled = false;
      const timeout = window.setTimeout(() => {
        finish(() => {
          reject(new Error("Native notification registration timed out."));
        });
      }, 15000);

      const cleanup = () => {
        window.clearTimeout(timeout);
        void registrationHandle?.remove();
        void registrationErrorHandle?.remove();
      };

      const finish = (callback: () => void) => {
        if (isSettled) {
          return;
        }

        isSettled = true;
        cleanup();
        callback();
      };

      const register = async () => {
        try {
          registrationHandle = await PushNotifications.addListener(
            "registration",
            (registrationToken) => {
              finish(() => {
                resolve(registrationToken.value);
              });
            },
          );

          registrationErrorHandle = await PushNotifications.addListener(
            "registrationError",
            (error) => {
              finish(() => {
                reject(
                  new Error(
                    error.error || "Could not register this device for alerts.",
                  ),
                );
              });
            },
          );

          await PushNotifications.register();
        } catch (error) {
          finish(() => {
            reject(
              error instanceof Error
                ? error
                : new Error("Could not register this device for alerts."),
            );
          });
        }
      };

      void register();
    });

    const response = await fetch("/api/push-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        deviceName: `${platform === "IOS" ? "iOS" : "Android"} app`,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not save this device.");
    }

    window.localStorage.setItem(nativeTokenStorageKey, token);
  };

  const handleDisableNativePush = async () => {
    const [{ Capacitor }, { PushNotifications }] = await Promise.all([
      import("@capacitor/core"),
      import("@capacitor/push-notifications"),
    ]);

    if (!Capacitor.isNativePlatform()) {
      throw new Error("Native notifications are not available here.");
    }

    const token = window.localStorage.getItem(nativeTokenStorageKey);

    if (token) {
      const response = await fetch("/api/push-subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Could not disable this device.");
      }
    }

    await PushNotifications.unregister();
    window.localStorage.removeItem(nativeTokenStorageKey);
  };

  const handleEnablePush = async () => {
    setStatus(null);
    setIsPending(true);

    try {
      if (deviceMode === "native") {
        await handleEnableNativePush();
        setStatus({
          type: "success",
          message: "This app is ready for alerts.",
        });
        setIsSubscribed(true);
        return;
      }

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
        body: JSON.stringify({
          ...subscription.toJSON(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
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
      if (deviceMode === "native") {
        await handleDisableNativePush();
        setIsSubscribed(false);
        setStatus({
          type: "success",
          message: "This app will no longer receive alerts.",
        });
        return;
      }

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
