<?php

namespace Tests\Feature;

use App\Enums\ArticleStatus;
use App\Enums\UserRole;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ModelRelationshipsTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_models_generate_string_ids_and_resolve_relationships(): void
    {
        $user = User::create([
            'name' => 'News Admin',
            'email' => 'admin@example.com',
            'password_hash' => 'hashed-password',
            'role' => UserRole::ADMIN,
        ]);
        $category = Category::create([
            'name' => 'News',
            'slug' => 'news',
        ]);
        $article = Article::create([
            'title' => 'Model relationship test article',
            'slug' => 'model-relationship-test-article',
            'content' => 'Test content.',
            'status' => ArticleStatus::DRAFT,
            'category_id' => $category->id,
            'author_id' => $user->id,
        ]);

        $this->assertModelExists($user);
        $this->assertModelExists($category);
        $this->assertModelExists($article);

        $this->assertStringId($user->id);
        $this->assertStringId($category->id);
        $this->assertStringId($article->id);

        $this->assertSame(UserRole::ADMIN, $user->role);
        $this->assertSame(ArticleStatus::DRAFT, $article->status);

        $this->assertTrue($article->category->is($category));
        $this->assertTrue($article->author->is($user));
        $this->assertTrue($category->articles->contains($article));
        $this->assertTrue($user->articles->contains($article));
    }

    private function assertStringId(string $id): void
    {
        $this->assertGreaterThanOrEqual(25, strlen($id));
        $this->assertLessThanOrEqual(32, strlen($id));
        $this->assertStringStartsWith('c', $id);
    }
}
