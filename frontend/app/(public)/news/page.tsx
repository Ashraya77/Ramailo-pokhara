import type { Metadata } from "next";
import { Suspense } from "react";

import { listPublicArticles } from "@/app/lib/services/laravel-public";
import { siteConfig } from "@/app/lib/site-config";
import { NewsPageClient } from "./news-page-client";

const ARTICLES_PER_PAGE = 12;

const NEWS_DESCRIPTION =
  "पोखराबाट प्रकाशित ताजा समाचार, रिपोर्ट र सामुदायिक अपडेट पढ्नुहोस्।";

type NewsPageProps = {
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "ताजा समाचार";
  const canonical = new URL("/news", siteConfig.url);

  return {
    title,
    description: NEWS_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: NEWS_DESCRIPTION,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary",
      title,
      description: NEWS_DESCRIPTION,
    },
  };
}

export default async function NewsPage() {
  const result = await listPublicArticles({
    page: 1,
    limit: ARTICLES_PER_PAGE,
    sort: "publishedAt",
    order: "desc",
  });

  return (
    <Suspense fallback={null}>
      <NewsPageClient initialResult={result} />
    </Suspense>
  );
}
