import { ArticleCard, type PublicArticleSummary } from "@/components/public/homepage-news";

export function CategoryGrid({
  articles,
}: {
  articles: readonly PublicArticleSummary[];
}) {
  if (articles.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {articles.slice(0, 4).map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
