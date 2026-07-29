/// <reference types="@capacitor/push-notifications" />
/// <reference types="@capacitor/status-bar" />

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.getbingd.app",
  appName: "bingd",
  webDir: "public",
  server: {
    url: "https://getbingd.com",
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "banner", "list"],
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#000000",
      style: "DARK",
    },
  },
};

export default config;
