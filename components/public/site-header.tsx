import Image from "next/image";
import Link from "next/link";

import { ui } from "@/app/lib/ui-text";
import { CategoryNavigation } from "@/components/public/category-navigation";
import type { PublicCategory } from "@/components/public/category-navigation";

type SiteHeaderProps = {
  categories: readonly PublicCategory[];
};

export async function SiteHeader({ categories }: SiteHeaderProps) {
  return (
    <>
      <header className="site-header bg-background">
        <div />

        <div className="public-container flex min-h-24 items-center justify-center py-4 lg:min-h-36">
          <Link
            href="/"
            aria-label={ui.navHome}
            className="flex items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
          >
            <Image
              src="/logo.png"
              alt=""
              width={144}
              height={144}
              className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20 lg:h-28 lg:w-28"
              priority
            />

            <span className="font-devanagari text-[1.8rem] leading-none font-black tracking-[-0.02em] text-[var(--public-ink)] sm:text-[2.2rem] lg:text-[2.8rem]">
              रमाइलो{" "}
              <span className="text-[var(--public-accent)]">पोखरा</span>
              .com
            </span>
          </Link>
        </div>
      </header>

      {categories.length > 0 && (
        <CategoryNavigation categories={categories} />
      )}
    </>
  );
}