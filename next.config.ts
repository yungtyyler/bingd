import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "static.tvmaze.com",
      },
    ],
  },
};

export default nextConfig;
