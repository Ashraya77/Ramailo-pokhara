<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ArticlePublicVisibilityTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_public_endpoints_return_exactly_the_currently_publishable_articles(): void
    {
        $visible = $this->createArticle();
        $hidden = [
            $this->createArticle(['status' => ArticleStatus::DRAFT]),
            $this->createArticle(['status' => ArticleStatus::ARCHIVED]),
            $this->createArticle(['published_at' => now()->addMinute()]),
            $this->createArticle(['published_at' => null]),
            $this->createArticleFor($this->createUser(false), $this->createCategory()),
            $this->createArticleFor($this->createUser(), $this->createCategory(false)),
        ];

        $this->getJson('/api/articles')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id);

        $this->getJson('/api/articles/slug/'.strtoupper(str_replace('-', '---', $visible->slug)))
            ->assertOk()
            ->assertJsonPath('data.id', $visible->id);

        foreach ($hidden as $article) {
            $this->getJson('/api/articles/slug/'.$article->slug)
                ->assertNotFound()
                ->assertJsonPath('error.code', 'ARTICLE_NOT_FOUND');
        }
    }

    public function test_public_slug_endpoint_returns_404_for_missing_and_unusable_slugs(): void
    {
        $this->getJson('/api/articles/slug/missing-article')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'ARTICLE_NOT_FOUND');

        $this->getJson('/api/articles/slug/!!!')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'ARTICLE_NOT_FOUND');
    }

    public function test_public_slug_endpoint_increments_views_and_listing_does_not(): void
    {
        $article = $this->createArticle(['views' => 4]);

        $this->getJson('/api/articles')->assertOk();

        $this->assertSame(4, $article->fresh()->views);

        $this->getJson('/api/articles/slug/'.$article->slug)
            ->assertOk()
            ->assertJsonPath('data.views', 5);
        $this->getJson('/api/articles/slug/'.$article->slug)
            ->assertOk()
            ->assertJsonPath('data.views', 6);
        $this->getJson('/api/articles/slug/'.$article->slug)
            ->assertOk()
            ->assertJsonPath('data.views', 7);

        $this->assertSame(7, $article->fresh()->views);
    }

    public function test_admin_detail_returns_hidden_articles_without_incrementing_views(): void
    {
        $article = $this->createArticle(['status' => ArticleStatus::DRAFT, 'published_at' => null, 'views' => 9]);
        $token = $this->createUser()->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/articles/'.$article->id)
            ->assertOk()
            ->assertJsonPath('data.id', $article->id)
            ->assertJsonPath('data.views', 9);

        $this->assertSame(9, $article->fresh()->views);
    }

    private function createArticle(array $attributes = []): Article
    {
        return $this->createArticleFor($this->createUser(), $this->createCategory(), $attributes);
    }

    private function createArticleFor(User $author, Category $category, array $attributes = []): Article
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

    private function createCategory(bool $active = true): Category
    {
        return Category::create([
            'name' => 'Category '.fake()->unique()->word(),
            'slug' => fake()->unique()->slug(),
            'is_active' => $active,
        ]);
    }
}
