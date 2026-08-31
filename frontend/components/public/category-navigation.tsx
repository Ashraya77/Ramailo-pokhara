import Link from "next/link";
import { Home } from "lucide-react";

export type PublicCategory = {
  name: string;
  slug: string;
  color: string | null;
};

type CategoryNavigationProps = {
  categories: readonly PublicCategory[];
};

export function CategoryNavigation({
  categories,
}: CategoryNavigationProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="News categories"
      className="
        hidden md:block
        sticky top-0 z-50
        bg-[var(--public-accent)]
        shadow-sm
      "
    >
        <div className="public-container overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex h-12 min-w-max items-stretch md:justify-center">
            <li className="flex">
              <Link
                href="/"
                aria-label="Home"
                className="
                  flex h-full items-center justify-center
                  px-4
                  text-white
                  transition-colors duration-200
                  hover:bg-[var(--public-breaking)]
                  focus-visible:bg-[var(--public-breaking)]
                  focus-visible:outline-none
                "
              >
                <Home className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug} className="flex">
                <Link
                  href={`/category/${encodeURIComponent(category.slug)}`}
                  className="
                    flex h-full items-center
                    px-5
                    text-sm font-semibold
                    text-white
                    transition-colors duration-200
                    hover:bg-[var(--public-breaking)]
                    focus-visible:bg-[var(--public-breaking)]
                    focus-visible:outline-none
                  "
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
    </nav>
  );
}