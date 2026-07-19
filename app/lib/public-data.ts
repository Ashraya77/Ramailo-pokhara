import "server-only";

import { cache } from "react";

import { listActivePublicCategories } from "@/app/lib/services/category";

export const getActivePublicCategories = cache(listActivePublicCategories);
