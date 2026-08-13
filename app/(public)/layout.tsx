import { getActivePublicCategories } from "@/app/lib/public-data";
import { ui } from "@/app/lib/ui-text";
import type { PublicCategory } from "@/components/public/category-navigation";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const activeCategories = await getActivePublicCategories();
  const categories: PublicCategory[] = activeCategories.map((category) => ({
    name: category.name,
    slug: category.slug,
    color: category.color,
  }));

  return (
    <div className="public-shell flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-50 bg-background px-4 py-2 font-medium focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-ring"
      >
        {ui.skipToContent}
      </a>
      <SiteHeader categories={categories} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter categories={categories} />
    </div>
  );
}
