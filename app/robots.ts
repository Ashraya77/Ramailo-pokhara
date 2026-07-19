import type { MetadataRoute } from "next";

import { siteConfig } from "@/app/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).href,
    host: siteConfig.url.origin,
  };
}
