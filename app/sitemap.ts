import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import prisma from "@/lib/prisma";

const routes = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const shows = await prisma.show.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      tvmazeId: true,
      updatedAt: true,
    },
    take: 500,
  });

  const staticRoutes = routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const showRoutes = shows.map((show) => ({
    url: `${SITE_URL}/shows/${show.tvmazeId}`,
    lastModified: show.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...showRoutes];
}
