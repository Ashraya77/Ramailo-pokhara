"use client";

import { useEffect, useState } from "react";

import { CategoryTable } from "@/components/admin/category-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryListItem } from "@/lib/admin-types";
import { get } from "@/lib/apiClient";
import { useAdminI18n } from "@/components/admin/admin-language-provider";

export default function CategoriesPage() {
  const { dictionary } = useAdminI18n();
  const [categories, setCategories] = useState<CategoryListItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    get<{ success: true; data: CategoryListItem[] }>("/api/categories")
      .then((response) => {
        if (active) {
          setCategories(response.data);
        }
      })
      .catch((error: unknown) => {
        console.error(error);

        if (active) {
          setLoadError(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage news portal categories, sorting orders, and statuses.
        </p>
      </div>

      {categories !== null ? (
        <CategoryTable initialCategories={categories} />
      ) : loadError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {dictionary.categories.loadError}
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="space-y-3 rounded-md border bg-card p-4"
        >
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      )}
    </div>
  );
}
