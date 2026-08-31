import { formatPublicDate, hasMeaningfulUpdate } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";

type ArticleMetaProps = {
  authorName: string;
  publishedAt: Date;
  updatedAt: Date;
  views: number;
};

export async function ArticleMeta({
  authorName,
  publishedAt,
  updatedAt,
  views,
}: ArticleMetaProps) {
  const viewFormatter = new Intl.NumberFormat("ne-NP-u-nu-deva");
  const showUpdatedAt = hasMeaningfulUpdate(publishedAt, updatedAt);

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3 text-xs tracking-wide text-[var(--public-muted)]">
      <div className="flex gap-1.5">
        <dt className="font-bold uppercase">{ui.articleAuthor}</dt>
        <dd className="font-bold text-[var(--public-ink)]">{authorName}</dd>
      </div>
      <div className="flex gap-1">
        <dt className="sr-only">{ui.articlePublished}</dt>
        <dd>
          <time dateTime={publishedAt.toISOString()}>
            {formatPublicDate(publishedAt)}
          </time>
        </dd>
      </div>
      {showUpdatedAt ? (
        <div className="flex gap-1">
          <dt className="font-bold uppercase">{ui.articleUpdated}</dt>
          <dd>
            <time dateTime={updatedAt.toISOString()}>
              {formatPublicDate(updatedAt)}
            </time>
          </dd>
        </div>
      ) : null}
      <div className="flex gap-1">
        <dt className="font-bold uppercase">{ui.articleViews}</dt>
        <dd>{viewFormatter.format(views)}</dd>
      </div>
    </dl>
  );
}
