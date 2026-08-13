import type { Metadata } from "next";

import { listArticles } from "@/app/lib/services/article";
import { getActivePublicCategories } from "@/app/lib/public-data";
import { siteConfig } from "@/app/lib/site-config";
import { getSiteStructuredData } from "@/app/lib/structured-data";
import { HomeBanner } from "@/components/home/HomeBanner";
import {
  EditorialCategorySection,
  MainNewsSection,
  type CategoryLayout,
} from "@/components/home/homepage-sections";
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

function normalizeCategorySlug(value: string): string {
  return value.trim().toLowerCase();
}

const orderedCategoryLayouts = [
  { slugs: ["local", "sthaniya"], layout: "lead-sidebar" as CategoryLayout },
  { slugs: ["tourism", "paryatan"], layout: "three-column" as CategoryLayout },
  { slugs: ["business", "byabasaya"], layout: "lead-list" as CategoryLayout },
  { slugs: ["sports", "khelkud"], layout: "lead-list" as CategoryLayout },
  { slugs: ["culture", "sanskriti"], layout: "feature-strip" as CategoryLayout },
  { slugs: ["technology", "tech", "pravidhi"], layout: "dense-grid" as CategoryLayout },
] as const;

export default async function HomePage() {
  const [breakingResult, featuredResult, latestResult, activeCategories] =
    await Promise.all([
      listArticles({ page: 1, limit: 8, breaking: true }, false),
      listArticles({ page: 1, limit: 12, featured: true }, false),
      listArticles({ page: 1, limit: 36 }, false),
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

  const latestFeaturedUsed = new Set<string>();
  const latestFeaturedLead = takeUnique(latestResult.articles, latestFeaturedUsed, 1)[0] ?? null;
  const latestFeaturedStories = takeUnique(latestResult.articles, latestFeaturedUsed, 3);

  const used = new Set<string>(latestFeaturedUsed);
  const leadPool = [...featuredResult.articles, ...latestResult.articles];
  const lead = takeUnique(leadPool, used, 1)[0] ?? null;
  const secondary = takeUnique(leadPool, used, 3);
  const breaking = takeUnique(breakingResult.articles, used, 6);
  const sidebar = takeUnique(latestResult.articles, used, 5);
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

  const categoriesBySlug = new Map(
    categories.map((section) => [normalizeCategorySlug(section.category.slug), section] as const),
  );

  const orderedSections = orderedCategoryLayouts
    .map(({ slugs, layout }) => {
      const match = slugs
        .map((slug) => categoriesBySlug.get(normalizeCategorySlug(slug)))
        .find(Boolean);

      if (!match) return null;
      return { ...match, layout };
    })
    .filter((section): section is NonNullable<typeof section> => section !== null);

  return (
    <>
      <JsonLd data={getSiteStructuredData()} />
      <HomeBanner
        featuredArticle={latestFeaturedLead}
        latestArticles={latestFeaturedStories}
      />
      <MainNewsSection
        breaking={breaking}
        lead={lead}
        secondary={secondary}
        sidebar={sidebar}
      />
      <div className="public-container flex flex-col gap-14 py-8 sm:gap-16 sm:py-10 lg:gap-20 lg:py-12">
        {orderedSections.map(({ category, articles, layout }) => (
          <EditorialCategorySection
            key={category.slug}
            category={category}
            articles={articles}
            layout={layout}
          />
        ))}
      </div>
    </>
  );
}
