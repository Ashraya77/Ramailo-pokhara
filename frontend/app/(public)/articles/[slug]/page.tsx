import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { normalizeArticleMetadataImage } from "@/app/lib/article-metadata-image";

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
import { LatestNewsSidebar } from "@/components/public/latest-news-sidebar";
import { RelatedNewsSection } from "@/components/public/related-news-section";
import { YouTubeEmbed } from "@/components/public/youtube-embed";

import {
  getArticlePageData,
  getLatestArticleSidebarData,
  getRelatedArticlePageData,
} from "./article-data";

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

    alternates: {
      canonical: canonicalUrl,
    },

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

  const [relatedArticles, latestArticles] = await Promise.all([
    getRelatedArticlePageData(article.id, article.category.id),
    getLatestArticleSidebarData(article.id),
  ]);

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
    {
      name: "गृहपृष्ठ",
      url: new URL("/", siteConfig.url),
    },
    {
      name: article.category.name,
      url: categoryUrl,
    },
    {
      name: article.title,
      url: canonicalUrl,
    },
  ]);



  return (
    <article className="bg-background">
      <JsonLd data={articleStructuredData} />
      <JsonLd data={breadcrumbStructuredData} />

      {/* Article heading */}
      <section className="public-container pt-8 sm:pt-12 lg:pt-14">
        <div className="mx-auto max-w-6xl">
          <ArticleHeader
            article={{
              ...article,
              publishedAt,
            }}
          />
        </div>
      </section>

      <section className="public-container mt-8 sm:mt-10 lg:mt-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start xl:gap-12">
          <div className="min-w-0">
            {article.featuredImage ? (
              <div className="overflow-hidden rounded-xl">
                <ArticleImage
                  src={article.featuredImage}
                  alt={article.featuredImageAlt}
                  title={article.title}
                  priority
                  sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 72vw, 1100px"
                />
              </div>
            ) : null}

            <div className="py-10 sm:py-12 lg:py-14">
              {article.youtubeUrl ? (
                <div className="mb-10">
                  <YouTubeEmbed
                    url={article.youtubeUrl}
                    articleTitle={article.title}
                  />
                </div>
              ) : null}

              <ArticleContent html={article.content} />
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <LatestNewsSidebar articles={latestArticles} />
          </div>
        </div>
        </div>
      </section>

      <RelatedNewsSection articles={relatedArticles} />

     
    </article>
  );
}
