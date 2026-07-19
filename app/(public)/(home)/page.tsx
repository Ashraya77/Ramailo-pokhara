import type { Metadata } from "next";

import { listArticles } from "@/app/lib/services/article";
import { getActivePublicCategories } from "@/app/lib/public-data";
import { siteConfig } from "@/app/lib/site-config";
import { getSiteStructuredData } from "@/app/lib/structured-data";
import {
  HomepageNews,
  type HomepageNewsData,
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
  const [breakingResult, featuredResult, latestResult, popularResult, activeCategories] =
    await Promise.all([
      listArticles({ page: 1, limit: 8, breaking: true }, false),
      listArticles({ page: 1, limit: 12, featured: true }, false),
      listArticles({ page: 1, limit: 36 }, false),
      listArticles({ page: 1, limit: 20, sort: "views", order: "desc" }, false),
      getActivePublicCategories(),
    ]);

  const categoryResults = await Promise.all(
    activeCategories.slice(0, 6).map(async (category) => ({
      category,
      result: await listArticles(
        { page: 1, limit: 12, categoryId: category.id },
        false,
      ),
    })),
  );

  const used = new Set<string>();
  const leadPool = [...featuredResult.articles, ...latestResult.articles];
  const lead = takeUnique(leadPool, used, 1)[0] ?? null;
  const secondary = takeUnique(leadPool, used, 3);
  const breaking = takeUnique(breakingResult.articles, used, 6);
  const sidebar = takeUnique(latestResult.articles, used, 5);
  const latest = takeUnique(latestResult.articles, used, 6);
  const popular = takeUnique(popularResult.articles, used, 8);
  const categories = categoryResults
    .map(({ category, result }) => {
      const publicCategory: PublicCategory = {
        name: category.name,
        slug: category.slug,
        color: category.color,
      };

      return {
        category: publicCategory,
        articles: takeUnique(result.articles, used, 4),
      };
    })
    .filter((section) => section.articles.length > 0);

  const data: HomepageNewsData = {
    breaking,
    lead,
    secondary,
    sidebar,
    latest,
    popular,
    categories,
  };

  return (
    <>
      <JsonLd data={getSiteStructuredData()} />
      <HomepageNews data={data} />
    </>
  );
}
