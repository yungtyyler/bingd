import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/feed",
        "/library",
        "/onboarding",
        "/offline",
        "/search",
        "/settings",
        "/shows",
        "/u",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
