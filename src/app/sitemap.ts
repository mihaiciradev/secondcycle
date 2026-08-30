import type { MetadataRoute } from "next";
import { db } from "@/server/db/client";
import { listPublicBikeSkus } from "@/server/services/bikes";
import { SITE_URL } from "@/lib/content/site";

// Recompute at most hourly so newly-published bikes appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/bikes`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/sell`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/legal-data`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/withdrawal-form`, changeFrequency: "yearly", priority: 0.2 },
  ];

  let bikeRoutes: MetadataRoute.Sitemap = [];
  try {
    const skus = await listPublicBikeSkus(db);
    bikeRoutes = skus.map((b) => ({
      url: `${SITE_URL}/bikes/${b.sku}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // If the DB is unreachable at build time, still ship the static sitemap.
  }

  return [...staticRoutes, ...bikeRoutes];
}
