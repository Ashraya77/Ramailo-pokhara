import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";
import { ArticleImage } from "@/components/public/article-image";
import type { PublicCategory } from "@/components/public/category-navigation";
import { cn } from "@/frontend/lib/utils";

export type PublicArticleSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: Date | null;
  views: number;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
};

type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  href?: string;
};

export function SectionHeading({ title, eyebrow, href }: SectionHeadingProps) {
  return (
    <div className="editorial-section-heading">
      <div className="min-w-0">
        {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
        <h2 className="editorial-section-title">{title}</h2>
      </div>
      {href ? (
        <Link className="editorial-more-link" href={href}>
          {ui.articleViewAll} <ArrowRightIcon aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function CategoryBadge({
  category,
  linked = true,
}: {
  category: PublicCategory;
  linked?: boolean;
}) {
  if (!linked) {
    return <span className="editorial-category-link">{category.name}</span>;
  }

  return (
    <Link
      href={`/category/${encodeURIComponent(category.slug)}`}
      className="editorial-category-link"
    >
      {category.name}
    </Link>
  );
}

function ArticleCategory({ article }: { article: PublicArticleSummary }) {
  return <CategoryBadge category={article.category} />;
}

function ArticleDate({ date }: { date: Date | null }) {
  if (!date) return null;

  return (
    <time dateTime={date.toISOString()} className="editorial-date">
      {formatPublicDateShort(date)}
    </time>
  );
}

export function LeadStory({ article }: { article: PublicArticleSummary }) {
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
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="aspect-[16/10] rounded-[2px]"
        />
      </Link>
      <div className="mt-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <ArticleCategory article={article} />
          <ArticleDate date={article.publishedAt} />
        </div>
        <h1 className="editorial-lead-title">
          <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
            {article.title}
          </Link>
        </h1>
        {article.excerpt ? (
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--public-muted)] sm:text-lg">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

type ArticleCardProps = {
  article: PublicArticleSummary;
  variant?: "standard" | "horizontal" | "text";
};

export function ArticleCard({
  article,
  variant = "standard",
}: ArticleCardProps) {
  if (variant === "horizontal") {
    return (
      <article className="group grid grid-cols-[minmax(0,1fr)_7.25rem] gap-4 border-b border-[var(--public-border)] pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_9rem]">
        <div className="min-w-0">
          <ArticleCategory article={article} />
          <h3 className="editorial-card-title mt-2 text-xl">
            <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
              {article.title}
            </Link>
          </h3>
          <ArticleDate date={article.publishedAt} />
        </div>
        <Link href={`/articles/${encodeURIComponent(article.slug)}`} tabIndex={-1}>
          <ArticleImage
            src={article.featuredImage}
            alt={article.featuredImageAlt}
            title={article.title}
            sizes="(max-width: 640px) 35vw, (max-width: 1024px) 45vw, 18vw"
            className="aspect-[4/3] rounded-[2px]"
          />
        </Link>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group",
        variant === "text" &&
          "border-b border-[var(--public-border)] pb-5 last:border-b-0 last:pb-0",
      )}
    >
      {variant === "standard" ? (
        <Link href={`/articles/${encodeURIComponent(article.slug)}`} tabIndex={-1}>
          <ArticleImage
            src={article.featuredImage}
            alt={article.featuredImageAlt}
            title={article.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="aspect-[4/3] rounded-[2px]"
          />
        </Link>
      ) : null}
      <div className={variant === "standard" ? "mt-4" : undefined}>
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <ArticleCategory article={article} />
          <ArticleDate date={article.publishedAt} />
        </div>
        <h3 className="editorial-card-title">
          <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
            {article.title}
          </Link>
        </h3>
        {variant === "standard" && article.excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--public-muted)]">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function CompactArticleRow({
  article,
  index,
}: {
  article: PublicArticleSummary;
  index?: number;
}) {
  return (
    <article className="group grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-[var(--public-border)] py-4 first:pt-0 last:border-b-0 last:pb-0">
      {index ? (
        <span aria-hidden="true" className="editorial-rank">
          {String(index).padStart(2, "0")}
        </span>
      ) : (
        <span aria-hidden="true" className="mt-2 size-1.5 bg-[var(--public-accent)]" />
      )}
      <div className="min-w-0">
        <h3 className="font-editorial text-lg leading-[1.35] font-bold">
          <Link
            className="text-[var(--public-ink)] no-underline transition-colors group-hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
            href={`/articles/${encodeURIComponent(article.slug)}`}
          >
            {article.title}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <ArticleCategory article={article} />
          <ArticleDate date={article.publishedAt} />
        </div>
      </div>
    </article>
  );
}

export function BreakingStrip({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <section aria-label="ताजा खबर" className="breaking-strip">
      <div className="public-container flex min-w-0 items-stretch">
        <p className="breaking-label">ताजा खबर</p>
        <div className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex min-w-max items-center gap-8 px-5 py-2.5">
            {articles.map((article) => (
              <li key={article.id} className="flex items-center gap-3 text-sm font-semibold">
                <span aria-hidden="true" className="size-1.5 bg-current" />
                <Link
                  className="no-underline transition-colors hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  href={`/articles/${encodeURIComponent(article.slug)}`}
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PopularNewsList({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  return (
    <div className="grid gap-x-10 md:grid-cols-2">
      {articles.map((article, index) => (
        <CompactArticleRow key={article.id} article={article} index={index + 1} />
      ))}
    </div>
  );
}

export function CategorySection({
  category,
  articles,
}: {
  category: PublicCategory;
  articles: readonly PublicArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="विशेष फोकस"
        title={category.name}
        href={`/category/${encodeURIComponent(category.slug)}`}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant={index === 0 ? "standard" : "text"}
          />
        ))}
      </div>
    </section>
  );
}

export type HomepageNewsData = {
  breaking: PublicArticleSummary[];
  lead: PublicArticleSummary | null;
  secondary: PublicArticleSummary[];
  sidebar: PublicArticleSummary[];
  latest: PublicArticleSummary[];
  popular: PublicArticleSummary[];
  categories: Array<{
    category: PublicCategory;
    articles: PublicArticleSummary[];
  }>;
};

export async function HomepageNews({ data }: { data: HomepageNewsData }) {
  const hasStories = Boolean(
    data.lead ||
      data.breaking.length ||
      data.secondary.length ||
      data.sidebar.length ||
      data.latest.length ||
      data.popular.length ||
      data.categories.some((section) => section.articles.length),
  );

  if (!hasStories) {
    return (
      <div className="public-container py-20 sm:py-28">
        <div className="max-w-2xl border-y border-[var(--public-border-strong)] py-10">
          <p className="editorial-kicker">{ui.homeNewsroom}</p>
          <h1 className="font-editorial mt-3 text-4xl leading-tight font-bold sm:text-5xl">
            {ui.homeEmptyTitle}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--public-muted)]">
            {ui.homeEmptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BreakingStrip articles={data.breaking} />
      <div className="public-container flex flex-col gap-14 py-8 sm:gap-16 sm:py-10 lg:gap-20 lg:py-12">
        {data.lead ? (
          <section aria-label="प्रमुख समाचार" className="editorial-main-grid">
            <div className="min-w-0 lg:border-r lg:border-[var(--public-border)] lg:pr-8">
              <LeadStory article={data.lead} />
            </div>
            {data.secondary.length ? (
              <div className="grid content-start gap-6 sm:grid-cols-2 lg:grid-cols-1">
                {data.secondary.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            ) : null}
            {data.sidebar.length ? (
              <aside className="border-t border-[var(--public-border-strong)] pt-5 lg:border-t-0 lg:border-l lg:border-[var(--public-border)] lg:pt-0 lg:pl-7">
                <p className="editorial-kicker mb-4">{ui.articleLatestUpdates}</p>
                {data.sidebar.map((article) => (
                  <CompactArticleRow key={article.id} article={article} />
                ))}
              </aside>
            ) : null}
          </section>
        ) : null}

        {data.latest.length ? (
          <section>
            <SectionHeading title={ui.articleLatest} eyebrow={ui.articleJustIn} href="/news" />
            <div className="grid gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {data.latest.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : null}

        {data.popular.length ? (
          <section className="popular-panel">
            <SectionHeading title={ui.articleMostRead} eyebrow={ui.articlePopular} />
            <PopularNewsList articles={data.popular} />
          </section>
        ) : null}

        {data.categories.map(({ category, articles }) => (
          <CategorySection key={category.slug} category={category} articles={articles} />
        ))}
      </div>
    </>
  );
}
