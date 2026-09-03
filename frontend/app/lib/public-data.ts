import "server-only";

import { cache } from "react";

import {
  listHomepageCategories,
  listPublicCategories,
} from "@/app/lib/services/laravel-public";

export const getActivePublicCategories = cache(listPublicCategories);
export const getHomepagePublicCategories = cache(listHomepageCategories);
