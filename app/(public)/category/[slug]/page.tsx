import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listArticles } from "@/app/lib/services/article";
import { siteConfig } from "@/app/lib/site-config";
import { getBreadcrumbStructuredData } from "@/app/lib/structured-data";
import {
  ArticleListingGrid,
  DiscoveryPageHeader,
  EditorialEmptyState,
  Pagination,
  parsePageParam,
  type PublicSearchParams,
} from "@/components/public/news-discovery";
import { JsonLd } from "@/components/public/json-ld";

import { getActiveCategoryPageData } from "./category-data";

const ARTICLES_PER_PAGE = 12;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<PublicSearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const category = await getActiveCategoryPageData(slug);

  if (!category) notFound();

  const page = parsePageParam(resolvedSearchParams.page);
  const title = page > 1 ? `${category.name} – Page ${page}` : category.name;
  const description =
    category.description ??
    `Read the latest published ${category.name} news and updates from Pokhara.`;
  const canonical = new URL(
    `/category/${encodeURIComponent(category.slug)}`,
    siteConfig.url,
  );

  if (page > 1) canonical.searchParams.set("page", String(page));

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
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const category = await getActiveCategoryPageData(slug);

  if (!category) notFound();

  const page = parsePageParam(resolvedSearchParams.page);
  const result = await listArticles(
    {
      page,
      limit: ARTICLES_PER_PAGE,
      categoryId: category.id,
      sort: "publishedAt",
      order: "desc",
    },
    false,
  );
  const description =
    category.description ??
    `The latest reporting and updates filed under ${category.name}.`;
  const categoryUrl = new URL(
    `/category/${encodeURIComponent(category.slug)}`,
    siteConfig.url,
  );
  const breadcrumbData = getBreadcrumbStructuredData([
    { name: "Home", url: new URL("/", siteConfig.url) },
    { name: category.name, url: categoryUrl },
  ]);

  return (
    <div className="public-container flex flex-col gap-10 py-8 sm:gap-12 sm:py-12 lg:py-16">
      <JsonLd data={breadcrumbData} />
      <DiscoveryPageHeader
        eyebrow="News category"
        title={category.name}
        description={description}
        accent={category.color}
        meta={`${result.meta.total} ${result.meta.total === 1 ? "article" : "articles"}`}
      />

      {result.articles.length ? (
        <ArticleListingGrid articles={result.articles} />
      ) : result.meta.total ? (
        <EditorialEmptyState
          eyebrow="Beyond the archive"
          title="There are no stories on this page."
          description={`Return to the first page of ${category.name} to continue reading.`}
          action={{
            href: `/category/${encodeURIComponent(category.slug)}?page=1`,
            label: `Return to ${category.name}`,
          }}
        />
      ) : (
        <EditorialEmptyState
          eyebrow="Category desk"
          title={`No ${category.name} stories have been published yet.`}
          description="Published reporting in this category will appear here."
          action={{ href: "/news", label: "Browse all latest news" }}
        />
      )}

      {result.articles.length ? (
        <Pagination
          currentPage={page}
          totalPages={result.meta.totalPages}
          pathname={`/category/${encodeURIComponent(category.slug)}`}
          searchParams={resolvedSearchParams}
        />
      ) : null}
    </div>
  );
}
