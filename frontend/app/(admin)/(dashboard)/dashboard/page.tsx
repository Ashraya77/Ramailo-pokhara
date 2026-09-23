"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FileEdit,
  FileText,
  FolderOpen,
  Globe,
  Pencil,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { useAdminI18n } from "@/components/admin/admin-language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/lib/apiClient";
import type {
  ArticleListItem,
  ArticleListMeta,
  CategoryListItem,
} from "@/lib/admin-types";

type ArticleListResponse = {
  success: true;
  data: ArticleListItem[];
  meta: ArticleListMeta;
};

type CategoryListResponse = {
  success: true;
  data: CategoryListItem[];
};

type LoadState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error" };

type MetricCardProps = {
  label: string;
  description: string;
  icon: LucideIcon;
  value: LoadState<number>;
};

const loadingState: LoadState<never> = { status: "loading" };

function toLoadState<T>(result: PromiseSettledResult<T>): LoadState<T> {
  return result.status === "fulfilled"
    ? { status: "success", data: result.value }
    : { status: "error" };
}

function mapLoadState<T, U>(
  state: LoadState<T>,
  mapper: (value: T) => U,
): LoadState<U> {
  if (state.status === "success") {
    return { status: "success", data: mapper(state.data) };
  }

  return state;
}

function MetricCard({ label, description, icon: Icon, value }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between">
          <CardDescription>{label}</CardDescription>
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {value.status === "loading" ? (
          <Skeleton className="h-8 w-16" />
        ) : value.status === "success" ? (
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {value.data.toLocaleString()}
          </CardTitle>
        ) : (
          <CardTitle className="text-2xl text-muted-foreground">—</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          {value.status === "error" ? "Unable to load this metric." : description}
        </p>
      </CardContent>
    </Card>
  );
}

function ArticleStatusBadge({ status }: { status: ArticleListItem["status"] }) {
  const { dictionary } = useAdminI18n();
  const label =
    status === "PUBLISHED"
      ? dictionary.status.published
      : status === "DRAFT"
        ? dictionary.status.draft
        : dictionary.status.archived;
  const variant =
    status === "PUBLISHED" ? "default" : status === "DRAFT" ? "secondary" : "outline";

  return <Badge variant={variant}>{label}</Badge>;
}

export default function AdminDashboardPage() {
  const { locale } = useAdminI18n();
  const [refreshKey, setRefreshKey] = useState(0);
  const [recentArticles, setRecentArticles] = useState<LoadState<ArticleListResponse>>(
    loadingState,
  );
  const [publishedArticles, setPublishedArticles] = useState<
    LoadState<ArticleListResponse>
  >(loadingState);
  const [draftArticles, setDraftArticles] = useState<LoadState<ArticleListResponse>>(
    loadingState,
  );
  const [categories, setCategories] = useState<LoadState<CategoryListResponse>>(
    loadingState,
  );

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      const [recentResult, publishedResult, draftResult, categoryResult] =
        await Promise.allSettled([
          get<ArticleListResponse>(
            "/api/articles?admin=true&limit=5&sort=updatedAt&order=desc",
          ),
          get<ArticleListResponse>("/api/articles?admin=true&status=PUBLISHED&limit=1"),
          get<ArticleListResponse>("/api/articles?admin=true&status=DRAFT&limit=1"),
          get<CategoryListResponse>("/api/categories"),
        ] as const);

      if (!active) {
        return;
      }

      setRecentArticles(toLoadState(recentResult));
      setPublishedArticles(toLoadState(publishedResult));
      setDraftArticles(toLoadState(draftResult));
      setCategories(toLoadState(categoryResult));
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );
  const totalArticles = mapLoadState(recentArticles, (response) => response.meta.total);
  const publishedCount = mapLoadState(publishedArticles, (response) => response.meta.total);
  const draftCount = mapLoadState(draftArticles, (response) => response.meta.total);
  const categoryCount = mapLoadState(categories, (response) => response.data.length);
  const retry = () => setRefreshKey((value) => value + 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your news portal and recent activity.
          </p>
        </div>
        <Button render={<Link href="/articles/new" />} className="gap-2">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      <section aria-label="Portal statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Articles"
          description="All articles in the portal"
          icon={FileText}
          value={totalArticles}
        />
        <MetricCard
          label="Published"
          description="Currently visible articles"
          icon={Globe}
          value={publishedCount}
        />
        <MetricCard
          label="Drafts"
          description="Articles awaiting publication"
          icon={FileEdit}
          value={draftCount}
        />
        <MetricCard
          label="Categories"
          description="Available news categories"
          icon={FolderOpen}
          value={categoryCount}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Latest updates across your newsroom.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/articles" />}>
              View all articles
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {recentArticles.status === "loading" ? (
              <div className="divide-y border-y">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto_auto] sm:px-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-7 w-14" />
                  </div>
                ))}
              </div>
            ) : recentArticles.status === "error" ? (
              <div className="flex flex-col items-start gap-3 px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  Recent articles could not be loaded.
                </p>
                <Button variant="outline" size="sm" onClick={retry}>
                  Retry
                </Button>
              </div>
            ) : recentArticles.data.data.length === 0 ? (
              <div className="flex flex-col items-start gap-3 px-6 py-10">
                <p className="text-sm text-muted-foreground">No articles have been created yet.</p>
                <Button size="sm" render={<Link href="/articles/new" />}>
                  <Plus className="h-4 w-4" />
                  Create your first article
                </Button>
              </div>
            ) : (
              <div className="divide-y border-y">
                {recentArticles.data.data.map((article) => (
                  <div
                    key={article.id}
                    className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{article.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{article.category.name}</span>
                        <span aria-hidden="true">•</span>
                        <time dateTime={article.updatedAt}>
                          Updated {dateFormatter.format(new Date(article.updatedAt))}
                        </time>
                      </div>
                    </div>
                    <ArticleStatusBadge status={article.status} />
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={"/articles/edit?id=" + encodeURIComponent(article.id)} />}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common newsroom tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="justify-start" render={<Link href="/articles/new" />}>
              <Plus className="h-4 w-4" />
              Create Article
            </Button>
            <Button variant="outline" className="justify-start" render={<Link href="/articles" />}>
              <FileText className="h-4 w-4" />
              Manage Articles
            </Button>
            <Button variant="outline" className="justify-start" render={<Link href="/categories" />}>
              <FolderOpen className="h-4 w-4" />
              Manage Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
