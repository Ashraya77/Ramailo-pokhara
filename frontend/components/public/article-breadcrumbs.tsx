import Link from "next/link";

import { ui } from "@/app/lib/ui-text";

type ArticleBreadcrumbsProps = {
  category: {
    name: string;
    slug: string;
  };
  title: string;
};

const linkClassName =
  "text-[var(--public-muted)] no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]";

export function ArticleBreadcrumbs({
  category,
  title,
}: ArticleBreadcrumbsProps) {
  return (
    <nav aria-label="ब्रेडक्रम्ब">
      <ol className="flex min-w-0 items-center gap-2 text-[0.68rem] font-bold tracking-[0.08em] uppercase">
        <li className="shrink-0">
          <Link href="/" className={linkClassName}>
            {ui.navHome}
          </Link>
        </li>
        <li aria-hidden="true" className="text-[var(--public-border-strong)]">
          —
        </li>
        <li className="shrink-0">
          <Link
            href={`/category/${encodeURIComponent(category.slug)}`}
            className={linkClassName}
          >
            {category.name}
          </Link>
        </li>
        <li aria-hidden="true" className="text-[var(--public-border-strong)]">
          —
        </li>
        <li aria-current="page" className="min-w-0 truncate text-[var(--public-muted)]">
          {title}
        </li>
      </ol>
    </nav>
  );
}
