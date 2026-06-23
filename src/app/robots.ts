import type { MetadataRoute } from "next";
import { APP_ORIGIN } from "@/lib/miniapp";

// Crawl the public pages; keep private splits, API and auth routes out. Split
// pages are also noindex per-page, but disallowing here stops crawl entirely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/k/", "/api/", "/auth/"],
    },
    sitemap: `${APP_ORIGIN}/sitemap.xml`,
    host: APP_ORIGIN,
  };
}
