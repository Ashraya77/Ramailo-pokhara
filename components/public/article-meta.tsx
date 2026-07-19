import { formatPublicDate, hasMeaningfulUpdate } from "@/app/lib/public-date";
import { siteConfig } from "@/app/lib/site-config";

type ArticleMetaProps = {
  authorName: string;
  publishedAt: Date;
  updatedAt: Date;
  views: number;
};

const viewFormatter = new Intl.NumberFormat(siteConfig.locale);

export function ArticleMeta({
  authorName,
  publishedAt,
  updatedAt,
  views,
}: ArticleMetaProps) {
  const showUpdatedAt = hasMeaningfulUpdate(publishedAt, updatedAt);

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3 text-xs tracking-wide text-[var(--public-muted)]">
      <div className="flex gap-1.5">
        <dt className="font-bold uppercase">By</dt>
        <dd className="font-bold text-[var(--public-ink)]">{authorName}</dd>
      </div>
      <div className="flex gap-1">
        <dt className="sr-only">Published</dt>
        <dd>
          <time dateTime={publishedAt.toISOString()}>
            {formatPublicDate(publishedAt)}
          </time>
        </dd>
      </div>
      {showUpdatedAt ? (
        <div className="flex gap-1">
          <dt className="font-bold uppercase">Updated</dt>
          <dd>
            <time dateTime={updatedAt.toISOString()}>
              {formatPublicDate(updatedAt)}
            </time>
          </dd>
        </div>
      ) : null}
      <div className="flex gap-1">
        <dt className="font-bold uppercase">Views</dt>
        <dd>{viewFormatter.format(views)}</dd>
      </div>
    </dl>
  );
}
