import { ArticleCard, type PublicArticleSummary } from "@/components/public/homepage-news";

import { FeatureStoryCard } from "@/components/home/category-layout-shared";

export function CategoryFeaturedList({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.95fr)] lg:gap-8">
      <FeatureStoryCard article={lead} />
      <div className="grid content-start gap-5">
        {rest.slice(0, 4).map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" />
        ))}
      </div>
    </div>
  );
}
