import { MetadataRoute } from "next";

const BASE_ADDRESS = process.env.BASE_ADDRESS;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/library", "/search", "/shows/*"],
    },
    sitemap: `${BASE_ADDRESS}/sitemap.xml`,
  };
}
