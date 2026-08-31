import { ArticleCard, type PublicArticleSummary } from "@/components/public/homepage-news";

import {
  FeatureStoryCard,
  HeadlineListItem,
} from "@/components/home/category-layout-shared";

export function CategoryMagazineLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  const mediumStories = rest.slice(0, 2);
  const headlines = rest.slice(2, 6);

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)] lg:gap-8">
      <FeatureStoryCard
        article={lead}
        imageRatio="aspect-[16/8]"
        sizes="(max-width: 1024px) 100vw, 52vw"
      />
      <div className="grid content-start gap-6">
        {mediumStories.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {mediumStories.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : null}
        {headlines.length ? (
          <div className="border-t border-[var(--public-border)] pt-2">
            {headlines.map((article) => (
              <HeadlineListItem key={article.id} article={article} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
