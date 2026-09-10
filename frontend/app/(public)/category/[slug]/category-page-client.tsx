"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type {
  PublicArticle,
  PublicCategory,
} from "@/app/lib/services/laravel-public";
import { siteConfig } from "@/app/lib/site-config";
import { getBreadcrumbStructuredData } from "@/app/lib/structured-data";
import { get } from "@/lib/apiClient";
import {
  ArticleListingGrid,
  DiscoveryPageHeader,
  EditorialEmptyState,
  Pagination,
  parsePageParam,
} from "@/components/public/news-discovery";
import { JsonLd } from "@/components/public/json-ld";

const ARTICLES_PER_PAGE = 12;

type ArticleResult = {
  articles: PublicArticle[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export function CategoryPageClient({
  category,
  initialResult,
}: {
  category: PublicCategory;
  initialResult: ArticleResult;
}) {
  const searchParams = useSearchParams();
  const page = parsePageParam(searchParams.get("page") ?? undefined);
  const [result, setResult] = useState(initialResult);

  useEffect(() => {
    if (page === 1) {
      setResult(initialResult);
      return;
    }

    const query = new URLSearchParams({
      page: String(page),
      limit: String(ARTICLES_PER_PAGE),
      categoryId: category.id,
      sort: "publishedAt",
      order: "desc",
    });

    get<ArticleResult & { data: PublicArticle[] }>(
      `/api/articles?${query.toString()}`,
    ).then((response) => {
      setResult({ articles: response.data, meta: response.meta });
    });
  }, [category.id, initialResult, page]);

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
          searchParams={{ page: String(page) }}
        />
      ) : null}
    </div>
  );
}