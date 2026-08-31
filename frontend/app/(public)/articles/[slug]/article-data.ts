import "server-only";

import { cache } from "react";

import {
  findPublishedArticleBySlug,
  listLatestPublishedArticles,
  listRelatedPublishedArticlesByCategory,
} from "@/app/lib/services/article";

export const getArticlePageData = cache(
  async (slug: string) => findPublishedArticleBySlug(slug),
);

export const getRelatedArticlePageData = cache(
  async (articleId: string, categoryId: string) =>
    listRelatedPublishedArticlesByCategory({
      articleId,
      categoryId,
      limit: 6,
    }),
);

export const getLatestArticleSidebarData = cache(
  async (articleId: string) =>
    listLatestPublishedArticles({
      excludeArticleId: articleId,
      limit: 6,
    }),
);
