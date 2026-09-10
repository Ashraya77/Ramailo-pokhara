import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  listPublicArticles,
  listPublicCategories,
} from "@/app/lib/services/laravel-public";
import { siteConfig } from "@/app/lib/site-config";
import { Suspense } from "react";

import { getActiveCategoryPageData } from "./category-data";
import { CategoryPageClient } from "./category-page-client";

const ARTICLES_PER_PAGE = 12;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getActiveCategoryPageData(slug);

  if (!category) notFound();

  const title = category.name;
  const description =
    category.description ??
    `पोखराबाट प्रकाशित ${category.name} सम्बन्धी ताजा समाचार र अपडेट पढ्नुहोस्।`;
  const canonical = new URL(
    `/category/${encodeURIComponent(category.slug)}`,
    siteConfig.url,
  );

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = await getActiveCategoryPageData(slug);

  if (!category) notFound();

  const result = await listPublicArticles({
    page: 1,
    limit: ARTICLES_PER_PAGE,
    categoryId: category.id,
    sort: "publishedAt",
    order: "desc",
  });
  return (
    <Suspense fallback={null}>
      <CategoryPageClient category={category} initialResult={result} />
    </Suspense>
  );
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const categories = await listPublicCategories();

  return categories.map((category) => ({ slug: category.slug }));
}
