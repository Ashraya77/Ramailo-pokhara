import type { Metadata } from "next";

import { CategoryListItem } from "@/lib/admin-types";
import { get as apiGet } from "@/lib/apiClient";
import { CategoryTable } from "@/components/admin/category-table";
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
  title: "Categories",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { dictionary } = await getAdminI18n();
  const response = await apiGet<{
    success: true;
    data: CategoryListItem[];
  }>("/api/categories", { cache: "no-store" });

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
            <BreadcrumbPage>{dictionary.categories.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.categories.title}
        </h1>
        <p className="text-muted-foreground">
          {dictionary.categories.description}
        </p>
      </div>

      <CategoryTable initialCategories={response.data} />
    </div>
  );
}
