import { normalizeArticleMetadataImage } from "@/app/lib/article-metadata-image";
import { listPublicArticles } from "@/app/lib/services/laravel-public";
import { siteConfig } from "@/app/lib/site-config";

export const dynamic = "force-static";
export const revalidate = 900;

const RSS_ARTICLE_LIMIT = 30;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await listPublicArticles({ limit: RSS_ARTICLE_LIMIT, sort: "publishedAt", order: "desc" }).then((result) => result.articles);
  const channelUrl = siteConfig.url.href;
  const feedUrl = new URL("/rss.xml", siteConfig.url).href;
  const items = articles.flatMap((article) => {
    if (!article.publishedAt) return [];

    const articleUrl = new URL(
      `/articles/${encodeURIComponent(article.slug)}`,
      siteConfig.url,
    ).href;
    const image = normalizeArticleMetadataImage(article.featuredImage);
    const description = article.excerpt ?? siteConfig.description;

    return [
      [
        "    <item>",
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${escapeXml(articleUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>`,
        `      <description>${escapeXml(description)}</description>`,
        `      <pubDate>${article.publishedAt.toUTCString()}</pubDate>`,
        `      <dc:creator>${escapeXml(article.author.name)}</dc:creator>`,
        `      <category>${escapeXml(article.category.name)}</category>`,
        ...(image
          ? [
              `      <media:content url="${escapeXml(image.href)}" medium="image" />`,
            ]
          : []),
        "    </item>",
      ].join("\n"),
    ];
  });
  const lastBuildDate = articles[0]?.updatedAt;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    "  <channel>",
    `    <title>${escapeXml(siteConfig.name)}</title>`,
    `    <link>${escapeXml(channelUrl)}</link>`,
    `    <description>${escapeXml(siteConfig.description)}</description>`,
    `    <language>${escapeXml(siteConfig.locale)}</language>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...(lastBuildDate
      ? [`    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`]
      : []),
    ...items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
