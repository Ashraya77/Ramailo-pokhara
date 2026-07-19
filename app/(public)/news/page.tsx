import type { Metadata } from "next";

import { listArticles } from "@/app/lib/services/article";
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
  "Read the latest published news, reporting, and community updates from Pokhara.";

type NewsPageProps = {
  searchParams: Promise<PublicSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: NewsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const title = page > 1 ? `Latest News – Page ${page}` : "Latest News";
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
  const result = await listArticles(
    {
      page,
      limit: ARTICLES_PER_PAGE,
      sort: "publishedAt",
      order: "desc",
    },
    false,
  );

  return (
    <div className="public-container flex flex-col gap-10 py-8 sm:gap-12 sm:py-12 lg:py-16">
      <DiscoveryPageHeader
        eyebrow="The latest"
        title="Latest news"
        description="New reporting, essential updates, and stories from Pokhara and the communities around it."
        meta={`${result.meta.total} ${result.meta.total === 1 ? "article" : "articles"}`}
      />

      {result.articles.length ? (
        <ArticleListingGrid articles={result.articles} />
      ) : result.meta.total ? (
        <EditorialEmptyState
          eyebrow="Beyond the archive"
          title="There are no stories on this page."
          description="This page is beyond the available news archive. Return to the beginning to continue reading."
          action={{ href: "/news?page=1", label: "Return to latest news" }}
        />
      ) : (
        <EditorialEmptyState
          eyebrow="The newsroom"
          title="No articles have been published yet."
          description="The latest reporting will appear here as soon as it is published."
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
