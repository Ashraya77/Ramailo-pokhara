import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";
import { ArticleImage } from "@/components/public/article-image";
import {
  ArticleCard,
  BreakingStrip,
  CategoryBadge,
  CompactArticleRow,
  LeadStory,
  type PublicArticleSummary,
} from "@/components/public/homepage-news";
import type { PublicCategory } from "@/components/public/category-navigation";

export type CategoryLayout =
  | "lead-sidebar"
  | "three-column"
  | "lead-list"
  | "feature-strip"
  | "dense-grid";

function EditorialSectionHeader({
  title,
  eyebrow,
  href,
  moreLabel,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  moreLabel?: string;
}) {
  return (
    <div className="editorial-section-heading">
      <div className="min-w-0">
        {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
        <h2 className="editorial-section-title">{title}</h2>
      </div>
      {href && moreLabel ? (
        <Link className="editorial-more-link" href={href}>
          {moreLabel}
        </Link>
      ) : null}
    </div>
  );
}

function ArticleDate({
  date,
}: {
  date: Date | null;
}) {
  if (!date) return null;

  return (
    <time dateTime={date.toISOString()} className="editorial-date">
      {formatPublicDateShort(date)}
    </time>
  );
}

function LeadArticleBlock({
  article,
  imageRatio = "aspect-[16/10]",
}: {
  article: PublicArticleSummary;
  imageRatio?: string;
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
          sizes="(max-width: 1024px) 100vw, 58vw"
          className={`${imageRatio} rounded-[2px]`}
        />
      </Link>
      <div className="mt-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoryBadge category={article.category} />
          <ArticleDate date={article.publishedAt} />
        </div>
        <h3 className="editorial-card-title text-[clamp(1.9rem,3vw,3rem)]">
          <Link href={`/articles/${encodeURIComponent(article.slug)}`}>
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--public-muted)] sm:text-base">
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function MainNewsSection({
  breaking,
  lead,
  secondary,
  sidebar,
}: {
  breaking: readonly PublicArticleSummary[];
  lead: PublicArticleSummary | null;
  secondary: readonly PublicArticleSummary[];
  sidebar: readonly PublicArticleSummary[];
}) {
  if (!lead && secondary.length === 0 && sidebar.length === 0 && breaking.length === 0) {
    return null;
  }

  return (
    <>
      <BreakingStrip articles={breaking} />
      <section className="public-container py-8 sm:py-10 lg:py-12">
        <EditorialSectionHeader
          title={ui.articleTopStories}
          eyebrow={ui.articleFocus}
          href="/news"
          moreLabel={ui.articleViewAll}
        />
        <div className="editorial-main-grid">
          {lead ? (
            <div className="min-w-0 lg:border-r lg:border-[var(--public-border)] lg:pr-8">
              <LeadStory article={lead} />
            </div>
          ) : null}
          {secondary.length ? (
            <div className="grid content-start gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {secondary.map((article) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          ) : null}
          {sidebar.length ? (
            <aside className="border-t border-[var(--public-border-strong)] pt-5 lg:border-t-0 lg:border-l lg:border-[var(--public-border)] lg:pt-0 lg:pl-7">
              <p className="editorial-kicker mb-4">{ui.articleLatestUpdates}</p>
              {sidebar.map((article) => (
                <CompactArticleRow key={article.id} article={article} />
              ))}
            </aside>
          ) : null}
        </div>
      </section>
    </>
  );
}

function LeadSidebarLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)] lg:gap-8">
      <LeadArticleBlock article={lead} />
      <div className="grid content-start gap-5">
        {rest.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" />
        ))}
      </div>
    </div>
  );
}

function ThreeColumnLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
      {articles.slice(0, 3).map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          variant={index === 0 ? "standard" : "text"}
        />
      ))}
    </div>
  );
}

function LeadListLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.85fr)] lg:gap-8">
      <LeadArticleBlock article={lead} imageRatio="aspect-[3/2]" />
      <div className="border-t border-[var(--public-border-strong)] pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
        {rest.slice(0, 4).map((article, index) => (
          <CompactArticleRow key={article.id} article={article} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

function FeatureStripLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <div className="space-y-7">
      <article className="group">
        <Link
          href={`/articles/${encodeURIComponent(lead.slug)}`}
          className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
        >
          <ArticleImage
            src={lead.featuredImage}
            alt={lead.featuredImageAlt}
            title={lead.title}
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="aspect-[16/8] rounded-[2px]"
          />
        </Link>
        <div className="mx-auto mt-5 max-w-4xl text-center">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <CategoryBadge category={lead.category} />
            <ArticleDate date={lead.publishedAt} />
          </div>
          <h3 className="font-editorial text-[clamp(2rem,3vw,3.2rem)] leading-[1.08] font-bold tracking-[-0.04em]">
            <Link href={`/articles/${encodeURIComponent(lead.slug)}`}>{lead.title}</Link>
          </h3>
          {lead.excerpt ? (
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-[var(--public-muted)] sm:text-base">
              {lead.excerpt}
            </p>
          ) : null}
        </div>
      </article>
      <div className="grid gap-6 md:grid-cols-3">
        {rest.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} variant="text" />
        ))}
      </div>
    </div>
  );
}

function DenseGridLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const feature = articles.slice(0, 2);
  const rest = articles.slice(2, 6);

  return (
    <div className="grid gap-6">
      {feature.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {feature.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}
      {rest.length ? (
        <div className="grid gap-x-6 border-t border-[var(--public-border)] pt-1 md:grid-cols-2">
          {rest.map((article) => (
            <CompactArticleRow key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function EditorialCategorySection({
  category,
  articles,
  layout,
}: {
  category: PublicCategory;
  articles: readonly PublicArticleSummary[];
  layout: CategoryLayout;
}) {
  if (articles.length === 0) return null;

  return (
    <section>
      <EditorialSectionHeader
        title={category.name}
        href={`/category/${encodeURIComponent(category.slug)}`}
        moreLabel={ui.articleViewAll}
      />
      {layout === "lead-sidebar" ? <LeadSidebarLayout articles={articles} /> : null}
      {layout === "three-column" ? <ThreeColumnLayout articles={articles} /> : null}
      {layout === "lead-list" ? <LeadListLayout articles={articles} /> : null}
      {layout === "feature-strip" ? <FeatureStripLayout articles={articles} /> : null}
      {layout === "dense-grid" ? <DenseGridLayout articles={articles} /> : null}
    </section>
  );
}
