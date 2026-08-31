import { ArticleCard, SectionHeading, type PublicArticleSummary } from "@/components/public/homepage-news";

type RelatedNewsSectionProps = {
  articles: readonly PublicArticleSummary[];
};

export function RelatedNewsSection({
  articles,
}: RelatedNewsSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--public-surface)]">
      <div className="public-container py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="सम्बन्धित समाचार" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-[var(--public-background)] p-4 sm:p-5"
              >
                <ArticleCard article={article} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
