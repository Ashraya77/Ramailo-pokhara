import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getArticleById } from "@/app/lib/services/article";
import { listCategories } from "@/app/lib/services/category";
import { ArticleForm } from "@/components/admin/article-form";
import { ArticleListItem } from "@/lib/admin-types";
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

export async function generateMetadata({
  params,
}: EditArticleProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);

  return {
    title: article ? `Edit: ${article.title}` : "Edit Article",
  };
}

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: EditArticleProps) {
  const { dictionary } = await getAdminI18n();
  const { id } = await params;
  const rawArticle = await getArticleById(id);

  if (!rawArticle) {
    notFound();
  }

  // Fetch categories
  const rawCategories = await listCategories({});
  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isActive: c.isActive,
  }));

  // Map dates and nested objects from Prisma service to type-safe interface for Client Component
  const initialData: ArticleListItem & { content?: string } = {
    ...rawArticle,
    publishedAt: rawArticle.publishedAt?.toISOString() ?? null,
    createdAt: rawArticle.createdAt.toISOString(),
    updatedAt: rawArticle.updatedAt.toISOString(),
    category: {
      ...rawArticle.category,
      color: rawArticle.category.color ?? null,
    },
    author: {
      ...rawArticle.author,
      name: rawArticle.author.name ?? "",
    },
    content: rawArticle.content,
  };

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

      <ArticleForm mode="edit" initialData={initialData} categories={categories} />
    </div>
  );
}
