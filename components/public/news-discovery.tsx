import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

import {
  ArticleCard,
  type PublicArticleSummary,
} from "@/components/public/homepage-news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PublicSearchParams = Record<
  string,
  string | string[] | undefined
>;

type DiscoveryPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string | null;
  meta?: string;
};

const SAFE_HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function DiscoveryPageHeader({
  eyebrow,
  title,
  description,
  accent,
  meta,
}: DiscoveryPageHeaderProps) {
  const borderColor = accent && SAFE_HEX_COLOR.test(accent) ? accent : undefined;

  return (
    <header
      className="border-t-[3px] border-[var(--public-accent)] border-b border-[var(--public-border-strong)] py-7 sm:py-9"
      style={borderColor ? { borderTopColor: borderColor } : undefined}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0 max-w-4xl">
          <p className="editorial-kicker">{eyebrow}</p>
          <h1 className="font-editorial mt-2 [overflow-wrap:anywhere] text-4xl leading-none font-black tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--public-muted)] sm:text-lg">
            {description}
          </p>
        </div>
        {meta ? (
          <p className="shrink-0 text-xs font-bold tracking-[0.08em] text-[var(--public-muted)] uppercase">
            {meta}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function ArticleListingGrid({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  return (
    <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

type EditorialEmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
};

export function EditorialEmptyState({
  eyebrow,
  title,
  description,
  action,
}: EditorialEmptyStateProps) {
  return (
    <section className="max-w-3xl border-y border-[var(--public-border-strong)] py-10 sm:py-12">
      <p className="editorial-kicker">{eyebrow}</p>
      <h2 className="font-editorial mt-3 text-3xl leading-tight font-black tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--public-muted)]">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--public-accent)] underline decoration-1 underline-offset-4"
        >
          {action.label}
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </section>
  );
}

function toUrlSearchParams(searchParams: PublicSearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params;
}

function getPageHref(
  pathname: string,
  page: number,
  searchParams: PublicSearchParams,
) {
  const params = toUrlSearchParams(searchParams);
  params.set("page", String(page));
  return `${pathname}?${params.toString()}`;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages]);
  for (
    let page = Math.max(2, currentPage - 1);
    page <= Math.min(totalPages - 1, currentPage + 1);
    page += 1
  ) {
    pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) {
      items.push(index === 1 ? "ellipsis-start" : "ellipsis-end");
    }
    items.push(page);
  });

  return items;
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  searchParams?: PublicSearchParams;
};

const paginationLinkClassName =
  "inline-flex min-h-10 min-w-10 items-center justify-center border border-[var(--public-border-strong)] px-3 text-sm font-bold transition-colors hover:bg-[var(--public-ink)] hover:text-[var(--public-paper)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-accent)]";

export function Pagination({
  currentPage,
  totalPages,
  pathname,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = getPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label="Article pagination"
      className="flex flex-col gap-4 border-t border-[var(--public-border-strong)] pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs font-bold tracking-[0.08em] text-[var(--public-muted)] uppercase">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={getPageHref(pathname, currentPage - 1, searchParams)}
            aria-label={`Go to page ${currentPage - 1}`}
            rel="prev"
            className={paginationLinkClassName}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(paginationLinkClassName, "cursor-not-allowed opacity-35")}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
          </span>
        )}

        {pageItems.map((item) =>
          typeof item === "number" ? (
            <Link
              key={item}
              href={getPageHref(pathname, item, searchParams)}
              aria-label={`Go to page ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
              className={cn(
                paginationLinkClassName,
                item === currentPage &&
                  "bg-[var(--public-accent)] text-white hover:bg-[var(--public-accent-dark)]",
              )}
            >
              {item}
            </Link>
          ) : (
            <span
              key={item}
              aria-hidden="true"
              className="inline-flex min-h-10 min-w-4 items-center justify-center text-[var(--public-muted)]"
            >
              …
            </span>
          ),
        )}

        {currentPage < totalPages ? (
          <Link
            href={getPageHref(pathname, currentPage + 1, searchParams)}
            aria-label={`Go to page ${currentPage + 1}`}
            rel="next"
            className={paginationLinkClassName}
          >
            <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(paginationLinkClassName, "cursor-not-allowed opacity-35")}
          >
            <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

export function SearchForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className="flex flex-col gap-3 border-y border-[var(--public-border-strong)] py-5 sm:flex-row"
    >
      <label htmlFor="public-news-search" className="sr-only">
        Search published news
      </label>
      <Input
        id="public-news-search"
        type="search"
        name="q"
        defaultValue={defaultQuery}
        minLength={2}
        maxLength={200}
        placeholder="Search headlines and summaries"
        className="h-12 rounded-none border-[var(--public-border-strong)] bg-transparent px-4 text-base shadow-none focus-visible:border-[var(--public-accent)] focus-visible:ring-[var(--public-accent)]/20"
      />
      <Button
        type="submit"
        size="lg"
        className="h-12 rounded-none bg-[var(--public-ink)] px-6 text-[var(--public-paper)] hover:bg-[var(--public-accent)]"
      >
        <SearchIcon data-icon="inline-start" />
        Search news
      </Button>
    </form>
  );
}

export function parsePageParam(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !/^\d+$/.test(candidate)) return 1;

  const page = Number(candidate);
  return Number.isSafeInteger(page) && page >= 1 && page <= 100_000 ? page : 1;
}
