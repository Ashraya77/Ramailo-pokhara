import {
  CategoryFeaturedList,
} from "@/components/home/category-featured-list";
import { CategoryGrid } from "@/components/home/category-grid";
import { CategoryHeadlineLayout } from "@/components/home/category-headline-layout";
import { CategoryHeroGrid } from "@/components/home/category-hero-grid";
import {
  CategorySectionHeading,
} from "@/components/home/category-layout-shared";
import { CategoryHorizontalList } from "@/components/home/category-horizontal-list";
import { CategoryMagazineLayout } from "@/components/home/category-magazine-layout";
import type { PublicCategory } from "@/components/public/category-navigation";
import type { PublicArticleSummary } from "@/components/public/homepage-news";

type HomepageCategoryLayout =
  | "featured-list"
  | "grid"
  | "hero-grid"
  | "horizontal"
  | "headline"
  | "magazine";

const layoutSequence: readonly HomepageCategoryLayout[] = [
  "magazine",
  "featured-list",
  "hero-grid",
  "grid",
  "headline",
  "horizontal",
];

function resolveLayout(index: number, articleCount: number): HomepageCategoryLayout {
  if (articleCount <= 2) return "horizontal";
  if (articleCount === 3) return index % 2 === 0 ? "headline" : "grid";
  return layoutSequence[index % layoutSequence.length];
}

export function CategorySection({
  category,
  articles,
  index,
}: {
  category: PublicCategory;
  articles: readonly PublicArticleSummary[];
  index: number;
}) {
  if (articles.length === 0) return null;

  const layout = resolveLayout(index, articles.length);

  return (
    <section>
      <CategorySectionHeading category={category} />
      {layout === "featured-list" ? <CategoryFeaturedList articles={articles} /> : null}
      {layout === "grid" ? <CategoryGrid articles={articles} /> : null}
      {layout === "hero-grid" ? <CategoryHeroGrid articles={articles} /> : null}
      {layout === "horizontal" ? <CategoryHorizontalList articles={articles} /> : null}
      {layout === "headline" ? <CategoryHeadlineLayout articles={articles} /> : null}
      {layout === "magazine" ? <CategoryMagazineLayout articles={articles} /> : null}
    </section>
  );
}
