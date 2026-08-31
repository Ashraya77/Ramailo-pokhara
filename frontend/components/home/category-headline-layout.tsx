import type { PublicArticleSummary } from "@/components/public/homepage-news";

import {
  FeatureStoryCard,
  HeadlineListItem,
} from "@/components/home/category-layout-shared";

export function CategoryHeadlineLayout({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.8fr)] lg:gap-8">
      <FeatureStoryCard article={lead} imageRatio="aspect-[16/9]" />
      <div className="border-t border-[var(--public-border-strong)] pt-4 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0">
        {rest.slice(0, 5).map((article) => (
          <HeadlineListItem key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
