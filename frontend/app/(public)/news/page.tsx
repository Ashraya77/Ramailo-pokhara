import type { Metadata } from "next";

import { listPublicArticles } from "@/app/lib/services/laravel-public";
import { siteConfig } from "@/app/lib/site-config";
import {
  ArticleListingGrid,
  DiscoveryPageHeader,
  EditorialEmptyState,
  Pagination,
  parsePageParam,
  type PublicSearchParams,
} from "@/components/public/news-discovery";

const ARTICLES_PER_PAGE = 12;

const NEWS_DESCRIPTION =
  "पोखराबाट प्रकाशित ताजा समाचार, रिपोर्ट र सामुदायिक अपडेट पढ्नुहोस्।";

type NewsPageProps = {
  searchParams: Promise<PublicSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: NewsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const title = page > 1 ? `ताजा समाचार – पृष्ठ ` : "ताजा समाचार";
  const canonical = new URL("/news", siteConfig.url);

  if (page > 1) canonical.searchParams.set("page", String(page));

  return {
    title,
    description: NEWS_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description: NEWS_DESCRIPTION,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary",
      title,
      description: NEWS_DESCRIPTION,
    },
  };
}

export default async function NewsPage({
  searchParams,
}: NewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parsePageParam(resolvedSearchParams.page);
  const result = await listPublicArticles(
    {
      page,
      limit: ARTICLES_PER_PAGE,
      sort: "publishedAt",
      order: "desc",
    }
  );

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
          searchParams={resolvedSearchParams}
        />
      ) : null}
    </div>
  );
}
