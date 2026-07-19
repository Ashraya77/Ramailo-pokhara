import "server-only";

import { cache } from "react";

import { findPublishedArticleBySlug } from "@/app/lib/services/article";

export const getArticlePageData = cache(
  async (slug: string) => findPublishedArticleBySlug(slug),
);
