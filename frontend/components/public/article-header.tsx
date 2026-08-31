import Link from "next/link";

import { formatUiText, ui } from "@/app/lib/ui-text";

import { ArticleBreadcrumbs } from "@/components/public/article-breadcrumbs";
import { ArticleMeta } from "@/components/public/article-meta";

type ArticleHeaderProps = {
  article: {
    title: string;
    excerpt: string | null;
    isBreaking: boolean;
    isFeatured: boolean;
    publishedAt: Date;
    updatedAt: Date;
    views: number;
    category: {
      name: string;
      slug: string;
    };
    author: {
      name: string;
    };
  };
};

export async function ArticleHeader({ article }: ArticleHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-[var(--public-border-strong)] pb-8 sm:gap-7 sm:pb-10">
      <ArticleBreadcrumbs category={article.category} title={article.title} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] font-extrabold tracking-[0.1em] uppercase">
        <Link
          href={`/category/${encodeURIComponent(article.category.slug)}`}
          aria-label={formatUiText("{category}का थप समाचार", {
            category: article.category.name,
          })}
          className="border-l-[3px] border-[var(--public-accent)] pl-2 text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
        >
          {article.category.name}
        </Link>
        {article.isBreaking ? (
          <span className="bg-[var(--public-accent)] px-2 py-1 text-white">{ui.articleBreaking}</span>
        ) : null}
        {article.isFeatured ? (
          <span className="border border-[var(--public-border-strong)] px-2 py-1">{ui.articleFeatured}</span>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="font-editorial [overflow-wrap:anywhere] text-4xl leading-[1.02] font-black tracking-[-0.045em] sm:text-6xl lg:text-[4.65rem]">
          {article.title}
        </h1>
        {article.excerpt ? (
          <p className="max-w-4xl text-lg leading-8 text-[var(--public-muted)] sm:text-xl sm:leading-9">
            {article.excerpt}
          </p>
        ) : null}
      </div>
      <ArticleMeta
        authorName={article.author.name}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        views={article.views}
      />
    </header>
  );
}
