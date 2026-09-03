import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listPublicArticles } from "@/app/lib/services/laravel-public";
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
  const title = page > 1 ? `${category.name} – पृष्ठ ${page}` : category.name;
  const description =
    category.description ??
    `पोखराबाट प्रकाशित ${category.name} सम्बन्धी ताजा समाचार र अपडेट पढ्नुहोस्।`;
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
  const result = await listPublicArticles(
    {
      page,
      limit: ARTICLES_PER_PAGE,
      categoryId: category.id,
      sort: "publishedAt",
      order: "desc",
    }
  );
  const description =
    category.description ??
    `${category.name} अन्तर्गतका ताजा रिपोर्ट र अपडेट।`;
  const categoryUrl = new URL(
    `/category/${encodeURIComponent(category.slug)}`,
    siteConfig.url,
  );
  const breadcrumbData = getBreadcrumbStructuredData([
    { name: "गृहपृष्ठ", url: new URL("/", siteConfig.url) },
    { name: category.name, url: categoryUrl },
  ]);

  return (
    <div className="public-container flex flex-col gap-10 py-8 sm:gap-12 sm:py-12 lg:py-16">
      <JsonLd data={breadcrumbData} />
      <DiscoveryPageHeader
        eyebrow="समाचार श्रेणी"
        title={category.name}
        description={description}
        accent={category.color}
        meta={`${result.meta.total} समाचार`}
      />

      {result.articles.length ? (
        <ArticleListingGrid articles={result.articles} />
      ) : result.meta.total ? (
        <EditorialEmptyState
          eyebrow="अभिलेखभन्दा बाहिर"
          title="यस पृष्ठमा कुनै समाचार छैन।"
          description={`${category.name} का समाचार पढ्न पहिलो पृष्ठमा फर्कनुहोस्।`}
          action={{
            href: `/category/${encodeURIComponent(category.slug)}?page=1`,
            label: `${category.name} मा फर्कनुहोस्`,
          }}
        />
      ) : (
        <EditorialEmptyState
          eyebrow="श्रेणी डेस्क"
          title={`${category.name} सम्बन्धी कुनै समाचार अहिलेसम्म प्रकाशित भएको छैन।`}
          description="यस श्रेणीमा प्रकाशित समाचार यहाँ देखिनेछन्।"
          action={{ href: "/news", label: "ताजा समाचार ब्राउज गर्नुहोस्" }}
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
