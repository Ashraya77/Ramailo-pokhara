import Link from "next/link";

import { formatPublicDate } from "@/app/lib/public-date";
import { ArticleImage } from "@/components/public/article-image";
import type { PublicArticleSummary } from "@/components/public/homepage-news";

type LatestNewsSidebarProps = {
  articles: readonly PublicArticleSummary[];
};

export function LatestNewsSidebar({
  articles,
}: LatestNewsSidebarProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="ताजा समाचार"
      className="bg-[var(--public-surface)]"
    >
      <div className="bg-[var(--public-accent)] px-4 py-4 text-center sm:px-5">
        <h2 className="font-editorial text-xl leading-none font-semibold tracking-tight text-white sm:text-[1.35rem]">
          ताजा समाचार
        </h2>
      </div>

      <div className="px-4 sm:px-5">
        <ul>
          {articles.map((article) => (
            <li key={article.id} className="py-4">
              <Link
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className="group grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-accent)]"
              >
                <ArticleImage
                  src={article.featuredImage}
                  alt={article.featuredImageAlt}
                  title={article.title}
                  sizes="88px"
                  className="aspect-[4/3] rounded-none"
                />

                <div className="min-w-0">
                  {article.category?.name ? (
                    <p className="mb-1 text-[0.64rem] font-extrabold tracking-[0.12em] text-[var(--public-accent)] uppercase">
                      {article.category.name}
                    </p>
                  ) : null}

                  <h3 className="line-clamp-3 text-sm leading-5 font-bold text-[var(--public-ink)] transition-colors group-hover:text-[var(--public-accent)]">
                    {article.title}
                  </h3>

                  {article.publishedAt ? (
                    <time
                      dateTime={article.publishedAt.toISOString()}
                      className="mt-2 block text-[0.76rem] leading-4 text-[var(--public-muted)]"
                    >
                      {formatPublicDate(article.publishedAt)}
                    </time>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
