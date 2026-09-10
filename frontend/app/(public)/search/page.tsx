import type { Metadata } from "next";
import { Suspense } from "react";

import { siteConfig } from "@/app/lib/site-config";
import { SearchPageClient } from "./search-page-client";

export const metadata: Metadata = {
  title: "समाचार खोज्नुहोस्",
  description: "शीर्षक र समाचार सारांशका आधारमा प्रकाशित समाचार खोज्नुहोस्।",
  alternates: { canonical: new URL("/search", siteConfig.url) },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageClient />
    </Suspense>
  );
}
