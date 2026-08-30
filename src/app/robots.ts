import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / transactional areas that shouldn't be indexed.
      disallow: ["/account", "/admin", "/workshop", "/checkout", "/cart", "/api/", "/login", "/register", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
