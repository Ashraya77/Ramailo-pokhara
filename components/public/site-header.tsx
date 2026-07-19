import Link from "next/link";

import { formatPublicDateShort } from "@/app/lib/public-date";
import { siteConfig } from "@/app/lib/site-config";
import { CategoryNavigation } from "@/components/public/category-navigation";
import type { PublicCategory } from "@/components/public/category-navigation";
import { MobileNavigation } from "@/components/public/mobile-navigation";

type SiteHeaderProps = {
  categories: readonly PublicCategory[];
};

export function SiteHeader({ categories }: SiteHeaderProps) {
  return (
    <header className="site-header bg-background">
      <div className="border-t-[3px] border-[var(--public-accent)] border-b border-[var(--public-border)]">
        <div className="public-container flex h-9 items-center justify-between text-[0.68rem] font-bold tracking-[0.12em] text-[var(--public-muted)] uppercase">
          <time dateTime={new Date().toISOString()}>
            {formatPublicDateShort(new Date())}
          </time>
          <p className="hidden sm:block">Independent news from Pokhara</p>
        </div>
      </div>
      <div className="public-container grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 py-3 lg:min-h-28 lg:grid-cols-[1fr_auto_1fr]">
        <p className="editorial-kicker hidden lg:block">News · Community · Culture</p>
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="font-editorial text-[1.75rem] leading-none font-black tracking-[-0.045em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)] sm:text-3xl lg:text-center lg:text-[2.65rem]"
        >
          Ramailo <span className="text-[var(--public-accent)]">Pokhara</span>
        </Link>
        <nav aria-label="Primary navigation" className="ml-auto hidden lg:block">
          <ul className="flex items-center justify-end gap-5 text-xs font-bold tracking-[0.08em] uppercase">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link className="editorial-nav-link" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto lg:hidden">
          <MobileNavigation categories={categories} />
        </div>
      </div>
      {categories.length ? (
        <div className="border-y border-[var(--public-border-strong)]">
          <CategoryNavigation categories={categories} />
        </div>
      ) : null}
    </header>
  );
}
