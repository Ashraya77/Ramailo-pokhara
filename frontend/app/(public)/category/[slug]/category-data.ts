import "server-only";

import { cache } from "react";

import { findPublicCategoryBySlug } from "@/app/lib/services/laravel-public";
import { slugify } from "@/app/lib/slug";

export const getActiveCategoryPageData = cache(async (rawSlug: string) => {
  if (rawSlug.length > 100) return null;

  const slug = slugify(rawSlug);
  if (!slug || slug !== rawSlug) return null;

  return findPublicCategoryBySlug(slug);
});
