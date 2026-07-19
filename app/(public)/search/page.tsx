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
  SearchForm,
} from "@/components/public/news-discovery";

import { normalizeSearchQuery } from "./search-query";

const ARTICLES_PER_PAGE = 12;

type SearchPageProps = {
  searchParams: Promise<PublicSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = normalizeSearchQuery(params.q);
  const title =
    search.status === "valid" ? `Search: ${search.query}` : "Search News";
  const description =
    "Search published Ramailo Pokhara news by headline and summary.";
  const canonical = new URL("/search", siteConfig.url);

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: false,
      follow: true,
    },
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = normalizeSearchQuery(resolvedSearchParams.q);
  const page = parsePageParam(resolvedSearchParams.page);
  const result =
    search.status === "valid"
      ? await listArticles(
          {
            page,
            limit: ARTICLES_PER_PAGE,
            search: search.query,
            sort: "publishedAt",
            order: "desc",
          },
          false,
        )
      : null;

  return (
    <div className="public-container flex flex-col gap-9 py-8 sm:gap-11 sm:py-12 lg:py-16">
      <DiscoveryPageHeader
        eyebrow="News archive"
        title="Search the news"
        description="Find published reporting by words in a headline or article summary."
        meta={
          result
            ? `${result.meta.total} ${result.meta.total === 1 ? "result" : "results"}`
            : undefined
        }
      />
      <SearchForm defaultQuery={search.inputValue} />

      {search.status === "initial" ? (
        <EditorialEmptyState
          eyebrow="Start here"
          title="Enter a phrase to explore the archive."
          description="Search for a place, person, event, or topic using at least two characters."
        />
      ) : search.status === "too-short" ? (
        <EditorialEmptyState
          eyebrow="Refine your search"
          title="That search is too short."
          description="Use at least two characters so the archive can return useful results."
        />
      ) : search.status === "too-long" ? (
        <EditorialEmptyState
          eyebrow="Refine your search"
          title="That search phrase is too long."
          description="Keep your search to 200 characters or fewer and try again."
        />
      ) : result?.articles.length ? (
        <section aria-labelledby="search-results-heading">
          <div className="editorial-section-heading">
            <div className="min-w-0">
              <p className="editorial-kicker">Search results</p>
              <h2 id="search-results-heading" className="editorial-section-title [overflow-wrap:anywhere]">
                “{search.query}”
              </h2>
            </div>
            <p className="shrink-0 text-xs font-bold tracking-wide text-[var(--public-muted)] uppercase">
              {result.meta.total} {result.meta.total === 1 ? "result" : "results"}
            </p>
          </div>
          <ArticleListingGrid articles={result.articles} />
        </section>
      ) : result?.meta.total ? (
        <EditorialEmptyState
          eyebrow="Beyond the results"
          title="There are no results on this page."
          description={`Return to the first page of results for “${search.query}”.`}
          action={{
            href: `/search?q=${encodeURIComponent(search.query)}&page=1`,
            label: "Return to first page",
          }}
        />
      ) : (
        <EditorialEmptyState
          eyebrow="No matches"
          title={`No published stories matched “${search.query}”.`}
          description="Try a broader phrase, check the spelling, or browse the latest reporting."
          action={{ href: "/news", label: "Browse latest news" }}
        />
      )}

      {result?.articles.length ? (
        <Pagination
          currentPage={page}
          totalPages={result.meta.totalPages}
          pathname="/search"
          searchParams={{ ...resolvedSearchParams, q: search.query }}
        />
      ) : null}
    </div>
  );
}
