import Link from "next/link";

export type PublicCategory = {
  name: string;
  slug: string;
  color: string | null;
};

type CategoryNavigationProps = {
  categories: readonly PublicCategory[];
};

const SAFE_HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function CategoryNavigation({
  categories,
}: CategoryNavigationProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav aria-label="News categories">
      <div className="public-container overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex min-w-max items-center gap-7 py-3 md:justify-center">
          {categories.map((category) => {
            const accent =
              category.color && SAFE_HEX_COLOR.test(category.color)
                ? category.color
                : undefined;

            return (
              <li key={category.slug}>
                <Link
                  href={`/category/${encodeURIComponent(category.slug)}`}
                  className="flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[var(--public-muted)] uppercase underline-offset-4 hover:text-[var(--public-ink)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
                >
                  <span
                    aria-hidden="true"
                    className="h-0.5 w-3 bg-[var(--public-accent)]"
                    style={accent ? { backgroundColor: accent } : undefined}
                  />
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
