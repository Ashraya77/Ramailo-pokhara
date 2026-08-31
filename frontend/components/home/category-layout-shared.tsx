import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";
import { ArticleImage } from "@/components/public/article-image";
import {
  CategoryBadge,
  type PublicArticleSummary,
} from "@/components/public/homepage-news";
import type { PublicCategory } from "@/components/public/category-navigation";
import { cn } from "@/frontend/lib/utils";

export function CategorySectionHeading({
  category,
}: {
  category: PublicCategory;
}) {
  return (
    <div className="editorial-section-heading">
      <h2 className="editorial-section-title">{category.name}</h2>
      <Link
        className="editorial-more-link"
        href={`/category/${encodeURIComponent(category.slug)}`}
      >
        {ui.articleViewAll}
      </Link>
    </div>
  );
}

export function ArticleMeta({
  article,
  centered = false,
}: {
  article: PublicArticleSummary;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1",
        centered && "justify-center",
      )}
    >
      <CategoryBadge category={article.category} />
      {article.publishedAt ? (
        <time dateTime={article.publishedAt.toISOString()} className="editorial-date">
          {formatPublicDateShort(article.publishedAt)}
        </time>
      ) : null}
    </div>
  );
}

export function FeatureStoryCard({
  article,
  imageRatio = "aspect-[16/10]",
  sizes = "(max-width: 1024px) 100vw, 58vw",
  titleClassName,
  centered = false,
}: {
  article: PublicArticleSummary;
  imageRatio?: string;
  sizes?: string;
  titleClassName?: string;
  centered?: boolean;
}) {
  return (
    <article className="group">
      <Link
        href={`/articles/${encodeURIComponent(article.slug)}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
      >
        <ArticleImage
          src={article.featuredImage}
          alt={article.featuredImageAlt}
          title={article.title}
          sizes={sizes}
          className={`${imageRatio} rounded-[2px]`}
        />
      </Link>
      <div className={cn("mt-5", centered && "text-center")}>
        <div className="mb-3">
          <ArticleMeta article={article} centered={centered} />
        </div>
        <h3
          className={cn(
            "editorial-card-title text-[clamp(1.9rem,3vw,3rem)]",
            titleClassName,
          )}
        >
          <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? (
          <p
            className={cn(
              "mt-3 max-w-3xl text-sm leading-7 text-[var(--public-muted)] sm:text-base",
              centered && "mx-auto",
            )}
          >
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function HeadlineListItem({
  article,
  bordered = true,
}: {
  article: PublicArticleSummary;
  bordered?: boolean;
}) {
  return (
    <article
      className={cn(
        "group py-4 first:pt-0 last:pb-0",
        bordered && "border-b border-[var(--public-border)] last:border-b-0",
      )}
    >
      <h3 className="font-editorial text-lg leading-[1.35] font-bold text-[var(--public-ink)]">
        <Link
          className="text-[var(--public-ink)] no-underline transition-colors group-hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
          href={`/articles/${encodeURIComponent(article.slug)}`}
        >
          {article.title}
        </Link>
      </h3>
      <div className="mt-2">
        <ArticleMeta article={article} />
      </div>
    </article>
  );
}

export function HorizontalStoryCard({
  article,
}: {
  article: PublicArticleSummary;
}) {
  return (
    <article className="group grid gap-4 border-b border-[var(--public-border)] pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
      <Link
        href={`/articles/${encodeURIComponent(article.slug)}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
      >
        <ArticleImage
          src={article.featuredImage}
          alt={article.featuredImageAlt}
          title={article.title}
          sizes="(max-width: 640px) 100vw, 9rem"
          className="aspect-[4/3] rounded-[2px]"
        />
      </Link>
      <div className="min-w-0">
        <div className="mb-2">
          <ArticleMeta article={article} />
        </div>
        <h3 className="editorial-card-title text-xl">
          <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--public-muted)]">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
