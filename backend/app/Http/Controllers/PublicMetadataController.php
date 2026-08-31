<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class PublicMetadataController extends Controller
{
    private const CACHE_SECONDS = 900;

    private const CACHE_CONTROL = 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600';

    public function rss(): Response
    {
        $xml = Cache::remember('public-metadata:rss', now()->addSeconds(self::CACHE_SECONDS), fn (): string => $this->rssXml());

        return response($xml, 200, [
            'Content-Type' => 'application/rss+xml; charset=UTF-8',
            'Cache-Control' => self::CACHE_CONTROL,
        ]);
    }

    public function sitemap(): Response
    {
        $xml = Cache::remember('public-metadata:sitemap', now()->addSeconds(self::CACHE_SECONDS), fn (): string => $this->sitemapXml());

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => self::CACHE_CONTROL,
        ]);
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /api',
            'Sitemap: '.$this->url('/sitemap.xml'),
            'Host: '.rtrim($this->siteUrl(), '/'),
            '',
        ]);

        return response($content, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    private function rssXml(): string
    {
        $articles = $this->publishableArticles(30);
        $items = $articles->map(fn (Article $article): string => implode("\n", array_filter([
            '    <item>',
            '      <title>'.$this->escape($article->title).'</title>',
            '      <link>'.$this->escape($this->articleUrl($article->slug)).'</link>',
            '      <guid isPermaLink="true">'.$this->escape($this->articleUrl($article->slug)).'</guid>',
            '      <description>'.$this->escape($article->excerpt ?? (string) config('site.description')).'</description>',
            '      <pubDate>'.$this->escape($article->published_at->toRfc7231String()).'</pubDate>',
            '      <dc:creator>'.$this->escape($article->author->name).'</dc:creator>',
            '      <category>'.$this->escape($article->category->name).'</category>',
            $this->rssImage($article->featured_image),
            '    </item>',
        ])))->all();

        $lastBuildDate = $articles->first()?->updated_at?->toRfc7231String();

        return implode("\n", array_filter([
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
            '  <channel>',
            '    <title>'.$this->escape((string) config('site.name')).'</title>',
            '    <link>'.$this->escape($this->siteUrl()).'</link>',
            '    <description>'.$this->escape((string) config('site.description')).'</description>',
            '    <language>'.$this->escape((string) config('site.locale')).'</language>',
            '    <atom:link href="'.$this->escape($this->url('/rss.xml')).'" rel="self" type="application/rss+xml" />',
            $lastBuildDate ? '    <lastBuildDate>'.$this->escape($lastBuildDate).'</lastBuildDate>' : null,
            ...$items,
            '  </channel>',
            '</rss>',
        ]));
    }

    private function sitemapXml(): string
    {
        $articles = $this->publishableArticles();
        $categories = Category::query()
            ->where('is_active', true)
            ->select(['slug', 'updated_at'])
            ->orderBy('slug')
            ->get();
        $latestArticleUpdate = $articles->max('updated_at');
        $entries = [
            $this->sitemapEntry($this->siteUrl(), $latestArticleUpdate, 'daily', '1.0'),
            $this->sitemapEntry($this->url('/news'), $latestArticleUpdate, 'hourly', '0.9'),
            ...$categories->map(fn (Category $category): string => $this->sitemapEntry(
                $this->categoryUrl($category->slug),
                $category->updated_at,
                'daily',
                '0.7',
            ))->all(),
            ...$articles->map(fn (Article $article): string => $this->sitemapEntry(
                $this->articleUrl($article->slug),
                $article->updated_at,
                'weekly',
                '0.8',
                $this->metadataImageUrl($article->featured_image),
            ))->all(),
        ];

        return implode("\n", [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
            ...$entries,
            '</urlset>',
        ]);
    }

    /**
     * @return Collection<int, Article>
     */
    private function publishableArticles(?int $limit = null): Collection
    {
        $query = Article::query()
            ->currentlyPublishable()
            ->select(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'updated_at', 'category_id', 'author_id'])
            ->with(['category:id,name,slug', 'author:id,name'])
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        if ($limit !== null) {
            $query->limit($limit);
        }

        return $query->get();
    }

    private function sitemapEntry(string $url, mixed $lastModified, string $changeFrequency, string $priority, ?string $image = null): string
    {
        $lines = [
            '  <url>',
            '    <loc>'.$this->escape($url).'</loc>',
        ];

        if ($lastModified !== null) {
            $lines[] = '    <lastmod>'.$this->escape($lastModified->toAtomString()).'</lastmod>';
        }

        $lines[] = '    <changefreq>'.$changeFrequency.'</changefreq>';
        $lines[] = '    <priority>'.$priority.'</priority>';

        if ($image !== null) {
            $lines[] = '    <image:image><image:loc>'.$this->escape($image).'</image:loc></image:image>';
        }

        $lines[] = '  </url>';

        return implode("\n", $lines);
    }

    private function rssImage(?string $value): ?string
    {
        $url = $this->metadataImageUrl($value);

        return $url === null ? null : '      <media:content url="'.$this->escape($url).'" medium="image" />';
    }

    private function metadataImageUrl(?string $value): ?string
    {
        $image = trim((string) $value);

        if ($image === '') {
            return null;
        }

        if (preg_match('#^/uploads/articles/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.webp$#i', $image)) {
            return $this->url($image);
        }

        if (! filter_var($image, FILTER_VALIDATE_URL)) {
            return null;
        }

        $parts = parse_url($image);
        if (! is_array($parts) || ! in_array(strtolower((string) ($parts['scheme'] ?? '')), ['http', 'https'], true) || isset($parts['user'], $parts['pass'])) {
            return null;
        }

        return $image;
    }

    private function articleUrl(string $slug): string
    {
        return $this->url('/articles/'.rawurlencode($slug));
    }

    private function categoryUrl(string $slug): string
    {
        return $this->url('/category/'.rawurlencode($slug));
    }

    private function siteUrl(): string
    {
        return rtrim((string) config('site.url'), '/');
    }

    private function url(string $path): string
    {
        return $this->siteUrl().'/'.ltrim($path, '/');
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
