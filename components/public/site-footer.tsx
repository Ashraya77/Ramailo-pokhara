import Link from "next/link";

import { siteConfig } from "@/app/lib/site-config";
import { ui } from "@/app/lib/ui-text";
import type { PublicCategory } from "@/components/public/category-navigation";

type SiteFooterProps = {
  categories: readonly PublicCategory[];
};

export async function SiteFooter({ categories }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t-[3px] border-[var(--public-accent)] bg-[var(--public-ink)] text-[var(--public-background)]">
      <div className="public-container flex flex-col gap-10 py-12 sm:py-16">
        <div className="grid gap-9 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div>
            <p className="font-editorial text-3xl font-black tracking-tight">{siteConfig.name}</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/60">{siteConfig.description}</p>
          </div>
          <nav aria-label={ui.navFooter}>
            <p className="mb-4 text-[0.68rem] font-bold tracking-[0.14em] text-white/45 uppercase">{ui.footerExplore}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link className="text-white/75 no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    className="text-white/75 no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    href={`/category/${encodeURIComponent(category.slug)}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="border-t border-white/15 pt-6 text-xs tracking-wide text-white/45">
          © {new Date().getFullYear()} {siteConfig.name}. {ui.footerCopyright}
        </p>
      </div>
    </footer>
  );
}
