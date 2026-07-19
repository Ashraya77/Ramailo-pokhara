import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after, connection } from "next/server";

import { normalizeArticleMetadataImage } from "@/app/lib/article-metadata-image";
import { incrementPublishedArticleViews } from "@/app/lib/services/article";
import { siteConfig } from "@/app/lib/site-config";
import { slugify } from "@/app/lib/slug";
import {
  getBreadcrumbStructuredData,
  getOrganizationNode,
  type NewsArticleStructuredData,
} from "@/app/lib/structured-data";
import { ArticleContent } from "@/components/public/article-content";
import { ArticleHeader } from "@/components/public/article-header";
import { ArticleImage } from "@/components/public/article-image";
import { JsonLd } from "@/components/public/json-ld";
import { YouTubeEmbed } from "@/components/public/youtube-embed";

import { getArticlePageData } from "./article-data";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = slugify(rawSlug);
  const article = slug ? await getArticlePageData(slug) : null;

  if (!article || !article.publishedAt) {
    notFound();
  }

  const title = article.metaTitle ?? article.title;
  const description =
    article.metaDescription ?? article.excerpt ?? siteConfig.description;
  const canonicalUrl = new URL(
    `/articles/${encodeURIComponent(article.slug)}`,
    siteConfig.url,
  );
  const image = normalizeArticleMetadataImage(article.featuredImage);
  const imageAlt = article.featuredImageAlt?.trim() || article.title;
  const titleSuffix = ` | ${siteConfig.name}`;
  const metadataTitle = title.toLocaleLowerCase().endsWith(
    titleSuffix.toLocaleLowerCase(),
  )
    ? { absolute: title }
    : title;

  return {
    title: metadataTitle,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name],
      section: article.category.name,
      images: image ? [{ url: image, alt: imageAlt }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [{ url: image, alt: imageAlt }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug: rawSlug } = await params;
  await connection();

  const slug = slugify(rawSlug);

  if (!slug) {
    notFound();
  }

  const article = await getArticlePageData(slug);

  if (!article || !article.publishedAt) {
    notFound();
  }

  const publishedAt = article.publishedAt;
  const canonicalUrl = new URL(
    `/articles/${encodeURIComponent(article.slug)}`,
    siteConfig.url,
  );
  const categoryUrl = new URL(
    `/category/${encodeURIComponent(article.category.slug)}`,
    siteConfig.url,
  );
  const metadataImage = normalizeArticleMetadataImage(article.featuredImage);
  const description =
    article.metaDescription ?? article.excerpt ?? siteConfig.description;
  const articleStructuredData: NewsArticleStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description,
    datePublished: publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: canonicalUrl.href,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: getOrganizationNode(),
    articleSection: article.category.name,
    inLanguage: siteConfig.locale,
    image: metadataImage ? [metadataImage.href] : undefined,
  };
  const breadcrumbStructuredData = getBreadcrumbStructuredData([
    { name: "Home", url: new URL("/", siteConfig.url) },
    { name: article.category.name, url: categoryUrl },
    { name: article.title, url: canonicalUrl },
  ]);

  after(async () => {
    try {
      await incrementPublishedArticleViews(article.id);
    } catch (error: unknown) {
      console.error("Failed to record article view", error);
    }
  });

  return (
    <article className="public-container flex flex-col gap-9 overflow-hidden py-8 sm:gap-12 sm:py-12 lg:py-16">
      <JsonLd data={articleStructuredData} />
      <JsonLd data={breadcrumbStructuredData} />
      <ArticleHeader article={{ ...article, publishedAt }} />
      {article.featuredImage ? (
        <ArticleImage
          src={article.featuredImage}
          alt={article.featuredImageAlt}
          title={article.title}
          priority
          sizes="(max-width: 1440px) calc(100vw - 4rem), 1376px"
        />
      ) : null}
      <YouTubeEmbed url={article.youtubeUrl} articleTitle={article.title} />
      <ArticleContent html={article.content} />
      <footer className="mx-auto flex w-full max-w-3xl flex-col gap-6 border-t-2 border-[var(--public-border-strong)] pt-6">
        <p className="editorial-kicker">Continue reading</p>
        <nav aria-label="Continue browsing" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
          <Link
            href={`/category/${encodeURIComponent(article.category.slug)}`}
            className="text-[var(--public-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
          >
            More from {article.category.name}
          </Link>
          <Link
            href="/news"
            className="text-[var(--public-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
          >
            View latest news
          </Link>
        </nav>
      </footer>
    </article>
  );
}
