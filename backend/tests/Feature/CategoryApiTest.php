<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_public_index_filters_active_state_searches_and_returns_article_counts(): void
    {
        $active = $this->createCategory(['name' => 'Technology', 'slug' => 'technology', 'sort_order' => 2]);
        $inactive = $this->createCategory(['name' => 'Sports', 'slug' => 'sports', 'description' => 'Daily scores', 'is_active' => false, 'sort_order' => 1]);
        $this->createArticle($active);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', $inactive->id)
            ->assertJsonPath('data.1._count.articles', 1);

        $this->getJson('/api/categories?active=true')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id);

        $this->getJson('/api/categories?active=false')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $inactive->id);

        $this->getJson('/api/categories?search=scores')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $inactive->id);
    }

    public function test_public_show_returns_category_and_missing_category_returns_404(): void
    {
        $category = $this->createCategory();
        $this->createArticle($category);

        $this->getJson('/api/categories/'.$category->id)
            ->assertOk()
            ->assertJsonPath('data.id', $category->id)
            ->assertJsonPath('data._count.articles', 1);

        $this->getJson('/api/categories/missing')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'CATEGORY_NOT_FOUND');
    }

    public function test_invalid_public_query_returns_validation_error(): void
    {
        $this->getJson('/api/categories?active=yes')
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_mutations_require_authentication(): void
    {
        $category = $this->createCategory();

        $this->postJson('/api/categories', ['name' => 'Politics'])
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');

        $this->patchJson('/api/categories/'.$category->id, ['name' => 'World'])
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');

        $this->deleteJson('/api/categories/'.$category->id)
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }

    public function test_admin_can_create_a_category_with_a_generated_slug(): void
    {
        $token = $this->adminToken();

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'Breaking News'])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'breaking-news')
            ->assertJsonPath('data.isActive', true)
            ->assertJsonPath('data.sortOrder', 0)
            ->assertJsonPath('data._count.articles', 0);

        $this->assertDatabaseHas('categories', ['name' => 'Breaking News', 'slug' => 'breaking-news']);
    }

    public function test_create_suffixes_colliding_slugs_and_treats_empty_slug_as_missing(): void
    {
        $this->createCategory(['name' => 'Existing', 'slug' => 'technology']);
        $token = $this->adminToken();

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'Technology Two', 'slug' => 'technology'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'technology-2');

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'Culture News', 'slug' => ''])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'culture-news');
    }

    public function test_create_rejects_invalid_payloads(): void
    {
        $token = $this->adminToken();

        $this->withToken($token)
            ->postJson('/api/categories', [])
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'A'])
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => str_repeat('A', 81)])
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'Color', 'color' => '#12345G'])
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'Order', 'sortOrder' => -1])
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');

        $this->withToken($token)
            ->postJson('/api/categories', ['name' => 'Unexpected', 'unknown' => true])
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    public function test_update_partially_updates_category_and_rejects_slug_collisions(): void
    {
        $category = $this->createCategory(['name' => 'Original', 'slug' => 'original']);
        $other = $this->createCategory(['name' => 'Other', 'slug' => 'other']);
        $token = $this->adminToken();

        $this->withToken($token)
            ->patchJson('/api/categories/'.$category->id, ['description' => null, 'sortOrder' => 4])
            ->assertOk()
            ->assertJsonPath('data.sortOrder', 4)
            ->assertJsonPath('data.description', null);

        $this->withToken($token)
            ->patchJson('/api/categories/'.$category->id, ['slug' => $other->slug])
            ->assertConflict()
            ->assertJsonPath('error.code', 'CATEGORY_CONFLICT');

        $this->withToken($token)
            ->patchJson('/api/categories/missing', ['name' => 'Missing'])
            ->assertNotFound()
            ->assertJsonPath('error.code', 'CATEGORY_NOT_FOUND');
    }

    public function test_delete_returns_category_or_conflict_when_it_is_in_use(): void
    {
        $unused = $this->createCategory(['name' => 'Unused', 'slug' => 'unused']);
        $used = $this->createCategory(['name' => 'Used', 'slug' => 'used']);
        $this->createArticle($used);
        $token = $this->adminToken();

        $this->withToken($token)
            ->deleteJson('/api/categories/'.$unused->id)
            ->assertOk()
            ->assertJsonPath('data.id', $unused->id);

        $this->assertModelMissing($unused);

        $this->withToken($token)
            ->deleteJson('/api/categories/'.$used->id)
            ->assertConflict()
            ->assertJsonPath('error.code', 'CATEGORY_IN_USE')
            ->assertJsonPath('error.details.articleCount', 1);

        $this->withToken($token)
            ->deleteJson('/api/categories/missing')
            ->assertNotFound()
            ->assertJsonPath('error.code', 'CATEGORY_NOT_FOUND');
    }

    public function test_malformed_json_returns_the_shared_error_envelope(): void
    {
        $token = $this->adminToken();

        $this->call('POST', '/api/categories', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer '.$token,
        ], '{')
            ->assertBadRequest()
            ->assertJsonPath('error.code', 'MALFORMED_JSON');
    }

    private function adminToken(): string
    {
        return $this->createUser()->createToken('test-token')->plainTextToken;
    }

    private function createUser(): User
    {
        return User::create([
            'name' => 'News Admin',
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => 'hashed-password',
            'role' => UserRole::ADMIN,
        ]);
    }

    private function createCategory(array $attributes = []): Category
    {
        return Category::create([
            'name' => 'Category '.fake()->unique()->word(),
            'slug' => fake()->unique()->slug(),
            ...$attributes,
        ]);
    }

    private function createArticle(Category $category): Article
    {
        return Article::create([
            'title' => 'Related article',
            'slug' => fake()->unique()->slug(),
            'content' => 'Article content.',
            'status' => ArticleStatus::DRAFT,
            'category_id' => $category->id,
            'author_id' => $this->createUser()->id,
        ]);
    }
}
