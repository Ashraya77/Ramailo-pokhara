import "server-only";

import { cache } from "react";

import {
  listActivePublicCategories,
  listActivePublicCategoriesWithArticles,
} from "@/app/lib/services/category";

export const getActivePublicCategories = cache(listActivePublicCategories);
export const getHomepagePublicCategories = cache(listActivePublicCategoriesWithArticles);
