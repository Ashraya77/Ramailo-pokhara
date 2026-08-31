import Image from "next/image";
import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { ui } from "@/app/lib/ui-text";
import { CategoryNavigation } from "@/components/public/category-navigation";
import type { PublicCategory } from "@/components/public/category-navigation";
import { MobileNavigation } from "@/components/public/mobile-navigation";

type SiteHeaderProps = {
  categories: readonly PublicCategory[];
};

export async function SiteHeader({ categories }: SiteHeaderProps) {
  const currentDate = formatPublicDateShort(new Date());

  return (
    <>
      <header className="site-header sticky top-0 z-50 bg-[var(--public-accent)] md:bg-background md:static">
        <div />
        <div className="public-container flex min-h-24 items-center justify-between gap-2 py-4 flex-nowrap md:min-h-36 md:justify-center">
          <Link
            href="/"
            aria-label={ui.navHome}
            className="flex min-w-0 items-center gap-2 sm:gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:focus-visible:outline-[var(--public-accent)]"
          >
            <Image
              src="/logo.jpeg"
              alt=""
              width={144}
              height={144}
              className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20 lg:h-28 lg:w-28"
              priority
            />

            <span className="flex min-w-0 flex-col items-center">
              <span className="font-devanagari text-[1.45rem] leading-none whitespace-nowrap font-black tracking-[-0.02em] text-white md:text-[var(--public-ink)] sm:text-[2.2rem] lg:text-[2.8rem]">
                रमाइलो{" "}
                <span className="text-white md:text-[var(--public-accent)]">पोखरा</span>
                .com
              </span>
              <span className="mt-1 py-1 text-center text-sm font-semibold text-white/80 md:text-[var(--public-muted)]">
                {currentDate}
              </span>
            </span>
          </Link>
          <div className="shrink-0 md:hidden"><MobileNavigation categories={categories} /></div>
        </div>
      </header>

      {categories.length > 0 && (
        <CategoryNavigation categories={categories} />
      )}
    </>
  );
}