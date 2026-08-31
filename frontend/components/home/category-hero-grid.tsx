import { ArticleCard, type PublicArticleSummary } from "@/components/public/homepage-news";

import {
  FeatureStoryCard,
  HeadlineListItem,
} from "@/components/home/category-layout-shared";

export function CategoryHeroGrid({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  const gridStories = rest.slice(0, 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
      <FeatureStoryCard
        article={lead}
        imageRatio="aspect-[4/3]"
        sizes="(max-width: 1024px) 100vw, 46vw"
      />
      <div className="grid content-start gap-6 sm:grid-cols-2">
        {gridStories.length >= 3
          ? gridStories.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant={index < 2 ? "standard" : "text"}
              />
            ))
          : rest.map((article) => (
              <HeadlineListItem key={article.id} article={article} />
            ))}
      </div>
    </div>
  );
}
