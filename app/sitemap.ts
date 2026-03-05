import { MetadataRoute } from "next";

const BASE_ADDRESS = process.env.BASE_ADDRESS;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_ADDRESS}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1.0,
    },
  ];
}
