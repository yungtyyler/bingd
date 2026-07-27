import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.getbingd.app",
  appName: "bingd",
  webDir: "public",
  server: {
    url: "https://getbingd.com",
    cleartext: false,
  },
};

export default config;

