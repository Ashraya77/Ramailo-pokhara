import { notFound } from "next/navigation";
import { connection } from "next/server";

import { slugify } from "@/app/lib/slug";

import { getArticlePageData } from "./article-data";

type ArticleRouteLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>;

export default async function ArticleRouteLayout({
  children,
  params,
}: ArticleRouteLayoutProps) {
  const { slug: rawSlug } = await params;
  await connection();

  const slug = slugify(rawSlug);
  const article = slug ? await getArticlePageData(slug) : null;

  if (!article || !article.publishedAt) {
    notFound();
  }

  return children;
}
