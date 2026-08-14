import type { PublicArticleSummary } from "@/components/public/homepage-news";

import { HorizontalStoryCard } from "@/components/home/category-layout-shared";

export function CategoryHorizontalList({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
      {articles.slice(0, 6).map((article) => (
        <HorizontalStoryCard key={article.id} article={article} />
      ))}
    </div>
  );
}
