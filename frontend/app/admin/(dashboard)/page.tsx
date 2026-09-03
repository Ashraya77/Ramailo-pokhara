import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileEdit,
  FileText,
  FolderOpen,
  Globe,
  Plus,
} from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ArticleListItem,
  ArticleListMeta,
  CategoryListItem,
} from "@/lib/admin-types";
import { get as apiGet } from "@/lib/apiClient";
import { getAdminI18n } from "@/lib/admin-i18n-server";
import type { AdminDictionary } from "@/lib/admin-i18n";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

function formatRelativeTime(
  date: Date,
  locale: string,
  dictionary: AdminDictionary,
): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const relativeTime = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) return dictionary.dashboard.justNow;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return relativeTime.format(-diffInMinutes, "minute");
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return relativeTime.format(-diffInHours, "hour");
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return dictionary.dashboard.yesterday;
  if (diffInDays < 7) return relativeTime.format(-diffInDays, "day");

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const [session, { dictionary, locale }] = await Promise.all([
    auth(),
    getAdminI18n(),
  ]);

  if (
    !session?.user ||
    session.user.role !== "ADMIN" ||
    !session.accessToken
  ) {
    redirect("/admin/login");
  }

  const requestOptions = {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: "no-store" as const,
  };

  const [
    articlesResponse,
    publishedResponse,
    draftResponse,
    categoriesResponse,
  ] = await Promise.all([
    apiGet<{
      success: true;
      data: ArticleListItem[];
      meta: ArticleListMeta;
    }>("/api/articles?admin=true&limit=5&sort=updatedAt&order=desc", requestOptions),
    apiGet<{
      success: true;
      data: ArticleListItem[];
      meta: ArticleListMeta;
    }>("/api/articles?admin=true&status=PUBLISHED&limit=1", requestOptions),
    apiGet<{
      success: true;
      data: ArticleListItem[];
      meta: ArticleListMeta;
    }>("/api/articles?admin=true&status=DRAFT&limit=1", requestOptions),
    apiGet<{ success: true; data: CategoryListItem[] }>(
      "/api/categories",
      requestOptions,
    ),
  ]);
  const totalArticles = articlesResponse.meta.total;
  const publishedArticles = publishedResponse.meta.total;
  const draftArticles = draftResponse.meta.total;
  const totalCategories = categoriesResponse.data.length;
  const recentArticles = articlesResponse.data;
  const numberFormatter = new Intl.NumberFormat(locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.dashboard.title}
        </h1>
        <p className="text-muted-foreground">
          {dictionary.dashboard.welcomeBack}, {session.user.name ?? "Admin"}.{" "}
          {dictionary.dashboard.overview}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.totalArticles}
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {numberFormatter.format(totalArticles)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.published}
            </CardTitle>
            <Globe className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberFormatter.format(publishedArticles)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.drafts}
            </CardTitle>
            <FileEdit className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberFormatter.format(draftArticles)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dictionary.dashboard.categories}
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {numberFormatter.format(totalCategories)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Articles */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {dictionary.dashboard.recentlyUpdated}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/articles" />}
            >
              {dictionary.common.viewAll}
            </Button>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {dictionary.dashboard.noArticles}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  nativeButton={false}
                  render={<Link href="/admin/articles/new" />}
                >
                  {dictionary.dashboard.createFirstArticle}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="font-medium text-sm text-primary hover:underline line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {article.category && (
                          <span
                            className="inline-block px-1.5 py-0.5 rounded font-medium text-[10px]"
                            style={{
                              backgroundColor: `${article.category.color}15`,
                              color: article.category.color ?? "inherit",
                            }}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {formatRelativeTime(
                            new Date(article.updatedAt),
                            locale,
                            dictionary,
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {numberFormatter.format(article.views)} {dictionary.dashboard.views}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        article.status === "PUBLISHED"
                          ? "default"
                          : article.status === "DRAFT"
                            ? "secondary"
                            : "outline"
                      }
                      className="capitalize"
                    >
                      {article.status === "PUBLISHED"
                        ? dictionary.status.published
                        : article.status === "DRAFT"
                          ? dictionary.status.draft
                          : dictionary.status.archived}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {dictionary.dashboard.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              className="w-full justify-start gap-2"
              nativeButton={false}
              render={<Link href="/admin/articles/new" />}
            >
              <Plus className="h-4 w-4" />
              {dictionary.dashboard.createArticle}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              nativeButton={false}
              render={<Link href="/admin/categories" />}
            >
              <FolderOpen className="h-4 w-4" />
              {dictionary.dashboard.manageCategories}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              nativeButton={false}
              render={<Link href="/" target="_blank" />}
            >
              <Globe className="h-4 w-4" />
              {dictionary.dashboard.viewPublicWebsite}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
