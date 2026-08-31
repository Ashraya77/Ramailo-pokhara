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
    search.status === "valid" ? `खोज: ${search.query}` : "समाचार खोज्नुहोस्";
  const description =
    "शीर्षक र समाचार सारांशका आधारमा प्रकाशित समाचार खोज्नुहोस्।";
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
        eyebrow="समाचार अभिलेख"
        title="समाचार खोज्नुहोस्"
        description="शीर्षक वा समाचार सारांशका शब्दबाट प्रकाशित रिपोर्ट खोज्नुहोस्।"
        meta={
          result
            ? `${result.meta.total} नतिजा`
            : undefined
        }
      />
      <SearchForm defaultQuery={search.inputValue} />

      {search.status === "initial" ? (
        <EditorialEmptyState
          eyebrow="यहाँबाट सुरु गर्नुहोस्"
          title="अभिलेख खोज्न शब्द लेख्नुहोस्।"
          description="स्थान, व्यक्ति, घटना वा विषय कम्तीमा दुई अक्षरमा खोज्नुहोस्।"
        />
      ) : search.status === "too-short" ? (
        <EditorialEmptyState
          eyebrow="खोजी परिमार्जन गर्नुहोस्"
          title="खोजी शब्द धेरै छोटो छ।"
          description="उपयोगी नतिजाका लागि कम्तीमा दुई अक्षर प्रयोग गर्नुहोस्।"
        />
      ) : search.status === "too-long" ? (
        <EditorialEmptyState
          eyebrow="खोजी परिमार्जन गर्नुहोस्"
          title="खोजी वाक्यांश धेरै लामो छ।"
          description="खोजी २०० अक्षर वा कममा सीमित राखी फेरि प्रयास गर्नुहोस्।"
        />
      ) : result?.articles.length ? (
        <section aria-labelledby="search-results-heading">
          <div className="editorial-section-heading">
            <div className="min-w-0">
              <p className="editorial-kicker">खोजी नतिजा</p>
              <h2 id="search-results-heading" className="editorial-section-title [overflow-wrap:anywhere]">
                “{search.query}”
              </h2>
            </div>
            <p className="shrink-0 text-xs font-bold tracking-wide text-[var(--public-muted)] uppercase">
              {result.meta.total} नतिजा
            </p>
          </div>
          <ArticleListingGrid articles={result.articles} />
        </section>
      ) : result?.meta.total ? (
        <EditorialEmptyState
          eyebrow="नतिजाभन्दा बाहिर"
          title="यस पृष्ठमा कुनै नतिजा छैन।"
          description={`“${search.query}” का नतिजाको पहिलो पृष्ठमा फर्कनुहोस्।`}
          action={{
            href: `/search?q=${encodeURIComponent(search.query)}&page=1`,
            label: "पहिलो पृष्ठमा फर्कनुहोस्",
          }}
        />
      ) : (
        <EditorialEmptyState
          eyebrow="मिल्ने समाचार भेटिएन"
          title={`“${search.query}” सँग मिल्ने प्रकाशित समाचार भेटिएन।`}
          description="अझ फराकिलो शब्द प्रयोग गर्नुहोस्, हिज्जे जाँच्नुहोस् वा ताजा समाचार ब्राउज गर्नुहोस्।"
          action={{ href: "/news", label: "ताजा समाचार हेर्नुहोस्" }}
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
