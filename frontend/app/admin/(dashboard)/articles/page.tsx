import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { auth } from "@/auth";
import {
  ArticleListItem,
  ArticleListMeta,
  CategoryListItem,
} from "@/lib/admin-types";
import { get as apiGet } from "@/lib/apiClient";
import { ArticleTable } from "@/components/admin/article-table";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAdminI18n } from "@/lib/admin-i18n-server";

export const metadata: Metadata = {
  title: "Articles",
};

export const dynamic = "force-dynamic";

type ArticlesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const [session, { dictionary }] = await Promise.all([
    auth(),
    getAdminI18n(),
  ]);

  if (!session?.accessToken) {
    redirect("/admin/login");
  }

  // Next.js 16 searchParams is a Promise and must be awaited
  const resolvedSearchParams = await searchParams;

  // Adapt values to match Zod validator expectations (forcing string conversions)
  const queryObj: Record<string, string> = {};
  for (const [key, val] of Object.entries(resolvedSearchParams)) {
    if (typeof val === "string") {
      queryObj[key] = val;
    } else if (Array.isArray(val) && val[0]) {
      queryObj[key] = val[0];
    }
  }

  // Force admin listing
  queryObj.admin = "true";

  const parameters = new URLSearchParams();

  for (const [key, value] of Object.entries(queryObj)) {
    if (value !== undefined) {
      parameters.set(key, String(value));
    }
  }

  const requestOptions = {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store" as const,
  };
  const [articlesResponse, categoriesResponse] = await Promise.all([
    apiGet<{
      success: true;
      data: ArticleListItem[];
      meta: ArticleListMeta;
    }>(`/api/articles?${parameters}`, requestOptions),
    apiGet<{ success: true; data: CategoryListItem[] }>(
      "/api/categories",
      requestOptions,
    ),
  ]);

  const categories = categoriesResponse.data.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">{dictionary.nav.dashboard}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{dictionary.articles.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dictionary.articles.title}
          </h1>
          <p className="text-muted-foreground">
            {dictionary.articles.description}
          </p>
        </div>
        <Button
          className="gap-2 shrink-0"
          nativeButton={false}
          render={<Link href="/admin/articles/new" />}
        >
          <Plus className="h-4 w-4" />
          {dictionary.articles.newArticle}
        </Button>
      </div>

      <ArticleTable
        initialArticles={articlesResponse.data}
        initialMeta={articlesResponse.meta}
        categories={categories}
      />
    </div>
  );
}
