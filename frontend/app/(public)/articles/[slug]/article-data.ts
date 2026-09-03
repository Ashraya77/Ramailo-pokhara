import "server-only";

import { cache } from "react";

import {
  getPublicArticleBySlug,
  listLatestPublicArticles,
  listRelatedPublicArticles,
} from "@/app/lib/services/laravel-public";

export const getArticlePageData = cache(getPublicArticleBySlug);

export const getRelatedArticlePageData = cache(
  async (articleId: string, categoryId: string) =>
    listRelatedPublicArticles(articleId, categoryId, 6),
);

export const getLatestArticleSidebarData = cache(
  async (articleId: string) => listLatestPublicArticles(articleId, 6),
);
