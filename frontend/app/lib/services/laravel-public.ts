import "server-only";

import { get as apiGet } from "@/lib/apiClient";

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  youtubeUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: Date | null;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string; color: string | null };
  author: { id: string; name: string };
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { articles: number };
};

type ArticleListResult = {
  articles: PublicArticle[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
};

type ArticleQuery = {
  page?: number; limit?: number; category?: string; categoryId?: string; search?: string;
  featured?: boolean; breaking?: boolean; sort?: "publishedAt" | "createdAt" | "updatedAt" | "title" | "views";
  order?: "asc" | "desc";
};

function article(article: Omit<PublicArticle, "publishedAt" | "createdAt" | "updatedAt"> & { publishedAt: string | null; createdAt: string | null; updatedAt: string | null }): PublicArticle {
  return { ...article, publishedAt: article.publishedAt ? new Date(article.publishedAt) : null, createdAt: new Date(article.createdAt ?? 0), updatedAt: new Date(article.updatedAt ?? 0) };
}

function category(category: Omit<PublicCategory, "createdAt" | "updatedAt"> & { createdAt: string | null; updatedAt: string | null }): PublicCategory {
  return { ...category, createdAt: new Date(category.createdAt ?? 0), updatedAt: new Date(category.updatedAt ?? 0) };
}

export async function listPublicArticles(query: ArticleQuery = {}): Promise<ArticleListResult> {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined) parameters.set(key, String(value));
  const response = await apiGet<{
    success: true;
    data: Parameters<typeof article>[0][];
    meta: ArticleListResult["meta"];
  }>(`/api/articles?${parameters}`, { next: { revalidate: 60 } });

  return { articles: response.data.map(article), meta: response.meta };
}

export async function listAllPublicArticles(
  query: Omit<ArticleQuery, "page" | "limit"> = {},
): Promise<PublicArticle[]> {
  const firstPage = await listPublicArticles({ ...query, page: 1, limit: 50 });
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(firstPage.meta.totalPages - 1, 0) },
      (_, index) => listPublicArticles({ ...query, page: index + 2, limit: 50 }),
    ),
  );

  return [
    ...firstPage.articles,
    ...remainingPages.flatMap((result) => result.articles),
  ];
}

export async function getPublicArticleBySlug(slug: string): Promise<PublicArticle | null> {
  try {
    const response = await apiGet<{
      success: true;
      data: Parameters<typeof article>[0];
    }>(`/api/articles/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });

    return article(response.data);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "API request failed with status 404."
    ) {
      return null;
    }

    throw error;
  }
}

export async function listPublicCategories(): Promise<PublicCategory[]> {
  const response = await apiGet<{
    success: true;
    data: Parameters<typeof category>[0][];
  }>("/api/categories?active=true", { next: { revalidate: 60 } });

  return response.data.map(category);
}

export async function findPublicCategoryBySlug(slug: string): Promise<PublicCategory | null> {
  return (await listPublicCategories()).find((item) => item.slug === slug) ?? null;
}

export async function listHomepageCategories(limitPerCategory = 6) {
  const categories = await listPublicCategories();
  const sections = await Promise.all(categories.map(async (item) => ({ ...item, articles: (await listPublicArticles({ category: item.slug, limit: limitPerCategory, sort: "publishedAt", order: "desc" })).articles })));
  return sections.filter((item) => item.articles.length > 0);
}

export async function listRelatedPublicArticles(articleId: string, categoryId: string, limit = 6): Promise<PublicArticle[]> {
  return (await listPublicArticles({ categoryId, limit: limit + 1, sort: "publishedAt", order: "desc" })).articles.filter((item) => item.id !== articleId).slice(0, limit);
}

export async function listLatestPublicArticles(excludeArticleId: string, limit = 6): Promise<PublicArticle[]> {
  return (await listPublicArticles({ limit: limit + 1, sort: "publishedAt", order: "desc" })).articles.filter((item) => item.id !== excludeArticleId).slice(0, limit);
}
