import { Clock3Icon } from "lucide-react";
import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";
import { ArticleImage } from "@/components/public/article-image";
import { CategoryBadge, type PublicArticleSummary } from "@/components/public/homepage-news";

type HomeBannerProps = {
  latestArticles: readonly PublicArticleSummary[];
};

export function HomeBanner({ latestArticles }: HomeBannerProps) {
  if (latestArticles.length === 0) {
    return null;
  }

  const topStories = latestArticles.slice(0, 3);

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

      {topStories.map((article, index) => (
        <article key={article.id} className="pt-5 sm:pt-6">
          <div className="mx-auto max-w-[68.75rem]">
            <h2 className="font-editorial text-center text-[clamp(2.2rem,4.5vw,4.4rem)] leading-[1.12] font-bold tracking-[-0.045em] text-[var(--public-ink)]">
              <Link
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
              >
                {article.title}
              </Link>
            </h2>

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
              <CategoryBadge category={article.category} />
              {article.publishedAt ? (
                <>
                  <span aria-hidden="true" className="text-[var(--public-border-strong)]/45">
                    •
                  </span>
                  <time
                    dateTime={article.publishedAt.toISOString()}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Clock3Icon aria-hidden="true" className="size-3.5" />
                    {formatPublicDateShort(article.publishedAt)}
                  </time>
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-6 sm:mt-7 lg:mt-8">
            <Link
              href={`/articles/${encodeURIComponent(article.slug)}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
            >
              <div className="mx-auto max-w-[72rem]">
                <ArticleImage
                  src={article.featuredImage}
                  alt={article.featuredImageAlt}
                  title={article.title}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1536px) 78vw, 1152px"
                  className="aspect-[16/8.5] rounded-[2px] border border-[var(--public-border-strong)]"
                />
              </div>
            </Link>
          </div>

          {article.excerpt ? (
            <div className="mx-auto mt-5 max-w-[62.5rem]">
              <p className="text-center text-sm leading-7 text-[var(--public-muted)] sm:text-base">
                {article.excerpt}
              </p>
            </div>
          ) : null}

          {index < topStories.length - 1 ? (
            <div className="mx-auto mt-6 max-w-[68.75rem] border-b border-[var(--public-border)]" />
          ) : null}
        </article>
      ))}
    </section>
  );
}
