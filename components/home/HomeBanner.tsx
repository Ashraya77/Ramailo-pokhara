import { Clock3Icon } from "lucide-react";
import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";
import { ArticleImage } from "@/components/public/article-image";
import { CategoryBadge, type PublicArticleSummary } from "@/components/public/homepage-news";

type HomeBannerProps = {
  featuredArticle: PublicArticleSummary | null;
  latestArticles: readonly PublicArticleSummary[];
};

export function HomeBanner({
  featuredArticle,
  latestArticles,
}: HomeBannerProps) {
  if (!featuredArticle && latestArticles.length === 0) {
    return null;
  }

  const compactLatest = latestArticles.slice(0, 3);

  return (
    <section
      aria-label={ui.homeBannerTitle}
      className="mx-auto w-full max-w-[94rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
    >
      <div className="border-t border-[var(--public-border-strong)] pt-7 sm:pt-9 lg:pt-11">
        <div className="mx-auto max-w-[68.75rem]">
          <p className="text-center text-[0.68rem] font-bold tracking-[0.12em] text-[var(--public-muted)] uppercase">
            {ui.homeBannerTitle}
          </p>
        </div>
      </div>

      {featuredArticle ? (
        <article className="pt-5 sm:pt-6">
          <div className="mx-auto max-w-[68.75rem]">
            <h1 className="font-editorial text-center text-[clamp(2.2rem,4.5vw,4.4rem)] leading-[1.12] font-bold tracking-[-0.045em] text-[var(--public-ink)]">
              <Link
                href={`/articles/${encodeURIComponent(featuredArticle.slug)}`}
                className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
              >
                {featuredArticle.title}
              </Link>
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.75rem] text-[var(--public-muted)] sm:text-[0.82rem]">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-6 items-center justify-center rounded-full border border-[var(--public-border)] font-semibold text-[var(--public-accent)]"
                >
                  RP
                </span>
                <span>रामाइलो पोखरा</span>
              </span>
              <span aria-hidden="true" className="text-[var(--public-border-strong)]/45">
                •
              </span>
              {featuredArticle.publishedAt ? (
                <time
                  dateTime={featuredArticle.publishedAt.toISOString()}
                  className="inline-flex items-center gap-1.5"
                >
                  <Clock3Icon aria-hidden="true" className="size-3.5" />
                  {formatPublicDateShort(featuredArticle.publishedAt)}
                </time>
              ) : null}
            </div>
          </div>

          <div className="mt-7 sm:mt-8 lg:mt-10">
            <Link
              href={`/articles/${encodeURIComponent(featuredArticle.slug)}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
            >
              <div className="mx-auto max-w-[87.5rem]">
                <ArticleImage
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.featuredImageAlt}
                  title={featuredArticle.title}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1536px) 92vw, 1400px"
                  className="aspect-[16/9] rounded-[2px] border border-[var(--public-border-strong)]"
                />
              </div>
            </Link>
          </div>

          {featuredArticle.excerpt ? (
            <div className="mx-auto mt-5 max-w-[62.5rem]">
              <p className="text-center text-sm leading-7 text-[var(--public-muted)] sm:text-base">
                {featuredArticle.excerpt}
              </p>
            </div>
          ) : null}

          <div className="mx-auto mt-6 max-w-[68.75rem] border-b border-[var(--public-border)]" />
        </article>
      ) : null}

      {compactLatest.length ? (
        <div className="mx-auto mt-8 max-w-[68.75rem] sm:mt-10">
          <div className="pb-3">
            <p className="editorial-kicker text-center sm:text-left">{ui.homeBannerLatest}</p>
          </div>
          <div className="divide-y divide-[var(--public-border)] border-y border-[var(--public-border)]">
            {compactLatest.map((article, index) => (
              <article
                key={article.id}
                className="grid gap-3 py-4 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start sm:gap-5 sm:py-5"
              >
                <span
                  aria-hidden="true"
                  className="font-editorial text-[1.7rem] leading-none font-bold tracking-[-0.06em] text-[var(--public-ink)]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-editorial text-xl leading-tight font-bold tracking-[-0.03em] text-[var(--public-ink)] sm:text-[1.55rem]">
                    <Link
                      className="text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
                      href={`/articles/${encodeURIComponent(article.slug)}`}
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.76rem] text-[var(--public-muted)] sm:text-[0.82rem]">
                    <CategoryBadge category={article.category} />
                    {article.publishedAt ? (
                      <>
                        <span aria-hidden="true">•</span>
                        <time dateTime={article.publishedAt.toISOString()}>
                          {formatPublicDateShort(article.publishedAt)}
                        </time>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
