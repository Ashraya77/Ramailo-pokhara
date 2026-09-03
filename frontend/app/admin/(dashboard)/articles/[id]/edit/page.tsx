import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ArticleForm } from "@/components/admin/article-form";
import { ArticleDetail, CategoryListItem } from "@/lib/admin-types";
import { get as apiGet } from "@/lib/apiClient";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAdminI18n } from "@/lib/admin-i18n-server";

type EditArticleProps = {
  params: Promise<{ id: string }>;
};

async function getArticle(
  id: string,
  accessToken: string,
): Promise<ArticleDetail | null> {
  try {
    const response = await apiGet<{
      success: true;
      data: ArticleDetail;
    }>(`/api/articles/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    return response.data;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "API request failed with status 404."
    ) {
      return null;
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: EditArticleProps): Promise<Metadata> {
  const session = await auth();

  if (!session?.accessToken) {
    return { title: "Edit Article" };
  }

  const { id } = await params;
  const article = await getArticle(id, session.accessToken);

  return {
    title: article ? `Edit: ${article.title}` : "Edit Article",
  };
}

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: EditArticleProps) {
  const [session, { dictionary }] = await Promise.all([
    auth(),
    getAdminI18n(),
  ]);

  if (!session?.accessToken) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [article, categoriesResponse] = await Promise.all([
    getArticle(id, session.accessToken),
    apiGet<{ success: true; data: CategoryListItem[] }>("/api/categories", {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: "no-store",
    }),
  ]);

  if (!article) {
    notFound();
  }

  const categories = categoriesResponse.data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
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
            <BreadcrumbLink href="/admin/articles">
              {dictionary.nav.articles}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{dictionary.articles.editArticle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ArticleForm mode="edit" initialData={article} categories={categories} />
    </div>
  );
}
