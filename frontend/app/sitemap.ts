import type { MetadataRoute } from "next";

import { normalizeArticleMetadataImage } from "@/app/lib/article-metadata-image";
import {
  listAllPublicArticles,
  listPublicCategories,
} from "@/app/lib/services/laravel-public";

import { siteConfig } from "@/app/lib/site-config";

export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    listAllPublicArticles({ sort: "publishedAt", order: "desc" }),
    listPublicCategories(),
  ]);
  const newestArticleUpdate = articles.reduce<Date | undefined>(
    (latest, article) =>
      !latest || article.updatedAt > latest ? article.updatedAt : latest,
    undefined,
  );

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url.href,
      lastModified: newestArticleUpdate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: new URL("/news", siteConfig.url).href,
      lastModified: newestArticleUpdate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: new URL(
      `/category/${encodeURIComponent(category.slug)}`,
      siteConfig.url,
    ).href,
    lastModified: category.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));
  const articleEntries: MetadataRoute.Sitemap = articles.flatMap((article) => {
    if (!article.publishedAt) return [];

    const image = normalizeArticleMetadataImage(article.featuredImage);

    return [
      {
        url: new URL(
          `/articles/${encodeURIComponent(article.slug)}`,
          siteConfig.url,
        ).href,
        lastModified: article.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: image ? [image.href] : undefined,
      },
    ];
  });

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
