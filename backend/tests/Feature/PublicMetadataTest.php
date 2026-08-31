<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PublicMetadataTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('site.url', 'https://news.example');
        Cache::forget('public-metadata:rss');
        Cache::forget('public-metadata:sitemap');
    }

    public function test_rss_returns_valid_escaped_xml_with_the_30_newest_publishable_articles(): void
    {
        $category = $this->createCategory('news');
        $author = $this->createUser();

        for ($index = 1; $index <= 31; $index++) {
            $this->createArticle($author, $category, [
                'title' => $index === 1 ? 'Newest & <important>' : 'Article '.$index,
                'excerpt' => $index === 1 ? 'Summary & <details>' : null,
                'slug' => 'article-'.$index,
                'published_at' => now()->subMinutes($index),
            ]);
        }

        $this->createArticle($author, $category, ['slug' => 'draft', 'status' => ArticleStatus::DRAFT]);
        $this->createArticle($author, $category, ['slug' => 'archived', 'status' => ArticleStatus::ARCHIVED]);
        $this->createArticle($author, $category, ['slug' => 'scheduled', 'published_at' => now()->addMinute()]);
        $this->createArticle($this->createUser(false), $category, ['slug' => 'inactive-author']);
        $this->createArticle($author, $this->createCategory('inactive-category', false), ['slug' => 'inactive-category']);

        $response = $this->get('/rss.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8')
            ->assertHeader('Cache-Control', 'max-age=0, public, s-maxage=900, stale-while-revalidate=3600');
        $xml = $response->getContent();
        $document = new \DOMDocument;

        $this->assertTrue($document->loadXML($xml));
        $this->assertSame(30, substr_count($xml, '<item>'));
        $this->assertStringContainsString('https://news.example/articles/article-1', $xml);
        $this->assertStringNotContainsString('https://news.example/articles/article-31', $xml);
        $this->assertStringContainsString('Newest &amp; &lt;important&gt;', $xml);
        $this->assertStringContainsString('Summary &amp; &lt;details&gt;', $xml);
        $this->assertLessThan(strpos($xml, 'https://news.example/articles/article-2'), strpos($xml, 'https://news.example/articles/article-1'));

        foreach (['draft', 'archived', 'scheduled', 'inactive-author', 'inactive-category'] as $slug) {
            $this->assertStringNotContainsString('/articles/'.$slug, $xml);
        }
    }

    public function test_sitemap_returns_active_categories_and_only_publishable_articles(): void
    {
        $category = $this->createCategory('active-category');
        $inactiveCategory = $this->createCategory('inactive-category', false);
        $author = $this->createUser();
        $visible = $this->createArticle($author, $category, ['slug' => 'visible-article']);

        $this->createArticle($author, $category, ['slug' => 'draft', 'status' => ArticleStatus::DRAFT]);
        $this->createArticle($author, $category, ['slug' => 'archived', 'status' => ArticleStatus::ARCHIVED]);
        $this->createArticle($author, $category, ['slug' => 'scheduled', 'published_at' => now()->addMinute()]);
        $this->createArticle($author, $category, ['slug' => 'without-date', 'published_at' => null]);
        $this->createArticle($this->createUser(false), $category, ['slug' => 'inactive-author']);
        $this->createArticle($author, $inactiveCategory, ['slug' => 'inactive-category-article']);

        $response = $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertHeader('Cache-Control', 'max-age=0, public, s-maxage=900, stale-while-revalidate=3600');
        $xml = $response->getContent();
        $document = new \DOMDocument;

        $this->assertTrue($document->loadXML($xml));
        $this->assertStringContainsString('<loc>https://news.example/category/active-category</loc>', $xml);
        $this->assertStringNotContainsString('/category/inactive-category</loc>', $xml);
        $this->assertStringContainsString('<loc>https://news.example/articles/'.$visible->slug.'</loc>', $xml);

        foreach (['draft', 'archived', 'scheduled', 'without-date', 'inactive-author', 'inactive-category-article'] as $slug) {
            $this->assertStringNotContainsString('/articles/'.$slug.'</loc>', $xml);
        }
    }

    public function test_robots_returns_text_with_disallowed_paths_and_a_sitemap_reference(): void
    {
        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSeeText('User-agent: *')
            ->assertSeeText('Disallow: /admin')
            ->assertSeeText('Disallow: /api')
            ->assertSeeText('Sitemap: https://news.example/sitemap.xml');
    }

    private function createArticle(User $author, Category $category, array $attributes = []): Article
    {
        return Article::create([
            'title' => 'Article '.fake()->unique()->sentence(3),
            'slug' => fake()->unique()->slug(),
            'content' => 'Article content.',
            'status' => ArticleStatus::PUBLISHED,
            'published_at' => now()->subMinute(),
            'category_id' => $category->id,
            'author_id' => $author->id,
            ...$attributes,
        ]);
    }

    private function createUser(bool $active = true): User
    {
        return User::create([
            'name' => 'News Admin',
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => 'hashed-password',
            'role' => UserRole::ADMIN,
            'is_active' => $active,
        ]);
    }

    private function createCategory(string $slug, bool $active = true): Category
    {
        return Category::create([
            'name' => 'Category '.str_replace('-', ' ', $slug),
            'slug' => $slug,
            'is_active' => $active,
        ]);
    }
}
