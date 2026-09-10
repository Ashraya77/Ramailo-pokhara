"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { PublicArticle } from "@/app/lib/services/laravel-public";
import { get } from "@/lib/apiClient";
import {
  ArticleListingGrid,
  DiscoveryPageHeader,
  EditorialEmptyState,
  Pagination,
  parsePageParam,
} from "@/components/public/news-discovery";

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

export function NewsPageClient({ initialResult }: { initialResult: ArticleResult }) {
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
      sort: "publishedAt",
      order: "desc",
    });

    get<ArticleResult & { data: PublicArticle[] }>(
      `/api/articles?${query.toString()}`,
    ).then((response) => {
      setResult({ articles: response.data, meta: response.meta });
    });
  }, [initialResult, page]);

  return (
    <div className="public-container flex flex-col gap-10 py-8 sm:gap-12 sm:py-12 lg:py-16">
      <DiscoveryPageHeader
        eyebrow="ताजा"
        title="ताजा समाचार"
        description="पोखरा र आसपासका समुदायका नयाँ रिपोर्ट, आवश्यक अपडेट र समाचार।"
        meta={`${result.meta.total} समाचार`}
      />

      {result.articles.length ? (
        <ArticleListingGrid articles={result.articles} />
      ) : result.meta.total ? (
        <EditorialEmptyState
          eyebrow="अभिलेखभन्दा बाहिर"
          title="यस पृष्ठमा कुनै समाचार छैन।"
          description="यो पृष्ठ उपलब्ध समाचार अभिलेखभन्दा बाहिर छ। पढ्न सुरुमा फर्कनुहोस्।"
          action={{ href: "/news?page=1", label: "ताजा समाचारमा फर्कनुहोस्" }}
        />
      ) : (
        <EditorialEmptyState
          eyebrow="समाचार कक्ष"
          title="अहिलेसम्म कुनै समाचार प्रकाशित भएको छैन।"
          description="प्रकाशित हुनेबित्तिकै ताजा रिपोर्ट यहाँ देखिनेछन्।"
        />
      )}

      {result.articles.length ? (
        <Pagination
          currentPage={page}
          totalPages={result.meta.totalPages}
          pathname="/news"
          searchParams={{ page: String(page) }}
        />
      ) : null}
    </div>
  );
}