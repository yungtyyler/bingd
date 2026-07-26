import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export const SITE_NAME = "bingd.";

export const DEFAULT_SEO_TITLE =
  "bingd. | Track TV shows and never miss new episodes";

export const DEFAULT_SEO_DESCRIPTION =
  "Track your shows, build your watchlist, follow friends, and get notified when new episodes and seasons are coming up.";

export const SEO_KEYWORDS = [
  "bingd",
  "TV show tracker",
  "watchlist app",
  "episode tracker",
  "show notifications",
  "streaming tracker",
  "TV reminders",
];

const DEFAULT_OG_IMAGE = "/opengraph-image";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata({
  title,
  description = DEFAULT_SEO_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} TV tracking app`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

