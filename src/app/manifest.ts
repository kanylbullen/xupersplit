import type { MetadataRoute } from "next";
import { SPLASH_BG } from "@/lib/miniapp";

// Makes the site installable ("Add to Home screen" / "Install app"): it opens
// full-screen from its own icon. Starts on the landing page, where MySplits
// lists the splits this device has opened.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "xupersplit",
    short_name: "xupersplit",
    description:
      "Split expenses with friends. Share the link and let everyone add what they paid.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: SPLASH_BG,
    theme_color: "#0d9488",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [{ name: "New split", url: "/new" }],
  };
}
