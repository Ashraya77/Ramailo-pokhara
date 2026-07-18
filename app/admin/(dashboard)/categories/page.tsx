import type { Metadata } from "next";

import { listCategories } from "@/app/lib/services/category";
import { CategoryListItem } from "@/lib/admin-types";
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
  // Fetch initial list of categories server-side
  const rawCategories = await listCategories({});
  
  // Transform dates to ISO strings to pass to Client Component safely
  const initialCategories: CategoryListItem[] = rawCategories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
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

      <CategoryTable initialCategories={initialCategories} />
    </div>
  );
}
