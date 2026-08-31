import type { Metadata } from "next";

import { listArticles } from "@/app/lib/services/article";
import { getHomepagePublicCategories } from "@/app/lib/public-data";
import { siteConfig } from "@/app/lib/site-config";
import { getSiteStructuredData } from "@/app/lib/structured-data";
import { CategorySection } from "@/components/home/category-section";
import { HomeBanner } from "@/components/home/HomeBanner";
import { MainNewsSection } from "@/components/home/homepage-sections";
import {
  type PublicArticleSummary,
} from "@/components/public/homepage-news";
import type { PublicCategory } from "@/components/public/category-navigation";
import { JsonLd } from "@/components/public/json-ld";

const homeUrl = new URL("/", siteConfig.url);

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description: siteConfig.description,
  alternates: { canonical: homeUrl },
  openGraph: {
    type: "website",
    title: siteConfig.name,
    description: siteConfig.description,
    url: homeUrl,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

function takeUnique(
  articles: readonly PublicArticleSummary[],
  used: Set<string>,
  limit: number,
): PublicArticleSummary[] {
  const selected: PublicArticleSummary[] = [];

  for (const article of articles) {
    if (used.has(article.id)) continue;
    used.add(article.id);
    selected.push(article);
    if (selected.length === limit) break;
  }

  return selected;
}

export default async function HomePage() {
  const [breakingResult, featuredResult, latestResult, homepageCategories] =
    await Promise.all([
      listArticles({ page: 1, limit: 8, breaking: true }, false),
      listArticles({ page: 1, limit: 12, featured: true }, false),
      listArticles({ page: 1, limit: 36 }, false),
      getHomepagePublicCategories(6),
    ]);

  const latestFeaturedStories = latestResult.articles.slice(0, 3);

  const used = new Set<string>(latestFeaturedStories.map((article) => article.id));
  const leadPool = [...featuredResult.articles, ...latestResult.articles];
  const lead = takeUnique(leadPool, used, 1)[0] ?? null;
  const secondary = takeUnique(leadPool, used, 3);
  const breaking = takeUnique(breakingResult.articles, used, 6);
  const sidebar = takeUnique(latestResult.articles, used, 5);
  const categories = homepageCategories
    .map((category) => {
      const publicCategory: PublicCategory = {
        name: category.name,
        slug: category.slug,
        color: category.color,
      };

      return {
        category: publicCategory,
        articles: category.articles,
      };
    })
    .filter((section) => section.articles.length > 0);

  return (
    <>
      <JsonLd data={getSiteStructuredData()} />
      <HomeBanner latestArticles={latestFeaturedStories} />
      <MainNewsSection
        breaking={breaking}
        lead={lead}
        secondary={secondary}
        sidebar={sidebar}
      />
      <div className="public-container flex flex-col gap-14 py-8 sm:gap-16 sm:py-10 lg:gap-20 lg:py-12">
        {categories.map(({ category, articles }, index) => (
          <CategorySection
            key={category.slug}
            category={category}
            articles={articles}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
