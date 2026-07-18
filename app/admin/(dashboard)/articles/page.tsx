import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { listArticles } from "@/app/lib/services/article";
import { listCategories } from "@/app/lib/services/category";
import { articleListQuerySchema } from "@/app/lib/validations/article";
import { ArticleListItem, ArticleListMeta } from "@/lib/admin-types";
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
  const { dictionary } = await getAdminI18n();
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

  const parsed = articleListQuerySchema.safeParse(queryObj);
  const validatedQuery = parsed.success
    ? parsed.data
    : { page: 1, limit: 10, admin: true };

  // Fetch articles and categories in parallel server-side
  const [articlesData, rawCategories] = await Promise.all([
    listArticles(validatedQuery, true),
    listCategories({}),
  ]);

  const initialArticles: ArticleListItem[] = articlesData.articles.map((art) => ({
    ...art,
    publishedAt: art.publishedAt?.toISOString() ?? null,
    createdAt: art.createdAt.toISOString(),
    updatedAt: art.updatedAt.toISOString(),
    category: {
      ...art.category,
      color: art.category.color ?? null,
    },
    author: {
      ...art.author,
      name: art.author.name ?? "",
    },
  }));

  const initialMeta: ArticleListMeta = {
    ...articlesData.meta,
  };

  const categories = rawCategories.map((cat) => ({
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
        initialArticles={initialArticles}
        initialMeta={initialMeta}
        categories={categories}
      />
    </div>
  );
}
