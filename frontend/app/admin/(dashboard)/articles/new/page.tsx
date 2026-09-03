import type { Metadata } from "next";

import { ArticleForm } from "@/components/admin/article-form";
import type { CategoryListItem } from "@/lib/admin-types";
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

export const metadata: Metadata = {
  title: "New Article",
};

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const { dictionary } = await getAdminI18n();
  const response = await apiGet<{
    success: true;
    data: CategoryListItem[];
  }>("/api/categories", { cache: "no-store" });
  const categories = response.data.map((c) => ({
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
            <BreadcrumbPage>{dictionary.articles.newArticle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ArticleForm mode="create" categories={categories} />
    </div>
  );
}
