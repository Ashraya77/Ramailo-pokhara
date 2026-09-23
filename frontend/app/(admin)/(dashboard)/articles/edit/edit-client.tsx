"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ArticleForm } from "@/components/admin/article-form";
import type { ArticleDetail, CategoryListItem } from "@/lib/admin-types";
import { get } from "@/lib/apiClient";

export default function EditArticleClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<{
    article: ArticleDetail;
    categories: CategoryListItem[];
  } | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      get<{ data: ArticleDetail }>(`/api/articles/${id}`),
      get<{ data: CategoryListItem[] }>("/api/categories"),
    ])
      .then(([article, categories]) =>
        setData({ article: article.data, categories: categories.data }),
      )
      .catch(() => setData(null));
  }, [id]);

  if (!id) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      {data ? (
        <ArticleForm
          mode="edit"
          initialData={data.article}
          categories={data.categories.map(({ id, name, slug, isActive }) => ({
            id,
            name,
            slug,
            isActive,
          }))}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}