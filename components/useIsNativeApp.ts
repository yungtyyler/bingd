"use client";

import { useEffect, useState } from "react";

export function useIsNativeApp() {
  const [isNativeApp, setIsNativeApp] = useState<boolean | null>(null);

  useEffect(() => {
    const detectNativeApp = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        setIsNativeApp(Capacitor.isNativePlatform());
      } catch {
        setIsNativeApp(false);
      }
    };

    void detectNativeApp();
  }, []);

  return isNativeApp;
}
