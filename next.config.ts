import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.tvmaze.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/shows",
        destination: "/search",
        permanent: true,
      },
      {
        source: "/show",
        destination: "/search",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
