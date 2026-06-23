import type { MetadataRoute } from "next";
import { APP_ORIGIN } from "@/lib/miniapp";

// Public, indexable pages. Private splits (/k/...) are intentionally excluded —
// they're capability-gated and noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/new", priority: 0.8, freq: "monthly" },
    { path: "/privacy", priority: 0.3, freq: "yearly" },
    { path: "/cookies", priority: 0.3, freq: "yearly" },
  ];
  return routes.map(({ path, priority, freq }) => ({
    url: `${APP_ORIGIN}${path}`,
    changeFrequency: freq,
    priority,
  }));
}
