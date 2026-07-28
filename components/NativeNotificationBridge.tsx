"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

function getInternalPath(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "/dashboard";
  }

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) {
      return "/dashboard";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

export default function NativeNotificationBridge() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let removeListeners: (() => void) | undefined;

    const registerNativeListeners = async () => {
      const [{ Capacitor }, { PushNotifications }] = await Promise.all([
        import("@capacitor/core"),
        import("@capacitor/push-notifications"),
      ]);

      if (!isMounted || !Capacitor.isNativePlatform()) {
        return;
      }

      const actionHandle = await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (action) => {
          router.push(getInternalPath(action.notification.data?.url));
        },
      );

      removeListeners = () => {
        void actionHandle.remove();
      };
    };

    void registerNativeListeners();

    return () => {
      isMounted = false;
      removeListeners?.();
    };
  }, [router]);

  return null;
}
