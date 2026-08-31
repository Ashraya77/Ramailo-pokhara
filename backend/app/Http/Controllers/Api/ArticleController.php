<?php

namespace App\Http\Controllers\Api;

use App\Enums\ArticleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Models\Category;
use App\Support\Slug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $page = filter_var($request->query('page', 1), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $limit = filter_var($request->query('limit', 10), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 50]]);
        $admin = $request->query('admin') === 'true' && $request->user()?->isActive() && $request->user()?->isAdmin();

        if ($page === false || $limit === false || ($request->query('category') !== null && $request->query('categoryId') !== null)) {
            return $this->error('VALIDATION_ERROR', 'The query parameters are invalid.', 400);
        }

        $query = Article::query()->with(['category:id,name,slug,color', 'author:id,name']);
        if (! $admin) {
            $query->currentlyPublishable();
        } elseif ($request->filled('status')) {
            if (! in_array($request->query('status'), array_column(ArticleStatus::cases(), 'value'), true)) {
                return $this->error('VALIDATION_ERROR', 'The status parameter is invalid.', 400);
            }
            $query->where('status', $request->query('status'));
        }

        foreach (['featured' => 'is_featured', 'breaking' => 'is_breaking'] as $input => $column) {
            if ($request->query($input) !== null) {
                if (! in_array($request->query($input), ['true', 'false'], true)) {
                    return $this->error('VALIDATION_ERROR', "The {$input} parameter must be true or false.", 400);
                }
                $query->where($column, $request->query($input) === 'true');
            }
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            if ((function_exists('grapheme_strlen') ? grapheme_strlen($search) : mb_strlen($search)) > 200) {
                return $this->error('VALIDATION_ERROR', 'The search parameter may not be greater than 200 characters.', 400);
            }
            $term = '%'.mb_strtolower($search).'%';
            $query->where(fn ($q) => $q->whereRaw('LOWER(title) LIKE ?', [$term])->orWhereRaw('LOWER(excerpt) LIKE ?', [$term]));
        }

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->query('category')));
        }
        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->query('categoryId'));
        }

        $sort = $request->query('sort', $admin ? 'updatedAt' : 'publishedAt');
        $columns = ['publishedAt' => 'published_at', 'createdAt' => 'created_at', 'updatedAt' => 'updated_at', 'title' => 'title', 'views' => 'views'];
        $order = $request->query('order', 'desc');
        if (! isset($columns[$sort]) || ! in_array($order, ['asc', 'desc'], true)) {
            return $this->error('VALIDATION_ERROR', 'The sort parameters are invalid.', 400);
        }

        $articles = $query->orderBy($columns[$sort], $order)->paginate($limit, ['*'], 'page', $page);

        return response()->json(['success' => true, 'data' => ArticleResource::collection($articles->getCollection())->resolve(), 'meta' => [
            'page' => $articles->currentPage(), 'limit' => $articles->perPage(), 'total' => $articles->total(), 'totalPages' => $articles->lastPage(),
            'hasNextPage' => $articles->hasMorePages(), 'hasPreviousPage' => $articles->currentPage() > 1,
        ]]);
    }

    public function store(StoreArticleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $category = $this->activeCategory($data['categoryId']);
        if ($category === null) {
            return $this->error('INVALID_CATEGORY', 'The category is invalid or inactive.', 400);
        }

        $slug = Slug::normalize($data['slug'] ?? $data['title']);
        $slug = $slug === '' ? 'news-'.now()->format('Ymd').'-'.str()->lower(str()->random(6)) : $slug;
        $status = $data['status'] ?? ArticleStatus::DRAFT->value;
        $article = Article::create($this->attributes($data, $category->id, $request->user()->id, $this->availableSlug($slug), $status));

        return response()->json(['success' => true, 'data' => (new ArticleResource($article->load(['category:id,name,slug,color', 'author:id,name'])))->resolve()], 201);
    }

    public function show(string $id): JsonResponse
    {
        $article = Article::with(['category:id,name,slug,color', 'author:id,name'])->find($id);

        return $article ? response()->json(['success' => true, 'data' => (new ArticleResource($article))->resolve()]) : $this->error('ARTICLE_NOT_FOUND', 'Article not found.', 404);
    }

    public function update(UpdateArticleRequest $request, string $id): JsonResponse
    {
        $article = Article::find($id);
        if (! $article) {
            return $this->error('ARTICLE_NOT_FOUND', 'Article not found.', 404);
        }
        $data = $request->validated();
        if (array_key_exists('categoryId', $data) && ! $this->activeCategory($data['categoryId'])) {
            return $this->error('INVALID_CATEGORY', 'The category is invalid or inactive.', 400);
        }
        if (array_key_exists('slug', $data)) {
            $slug = Slug::normalize($data['slug'] ?: ($data['title'] ?? $article->title));
            if ($slug === '') {
                return $this->error('INVALID_SLUG', 'The article slug is invalid.', 400);
            }
            if (Article::where('slug', $slug)->whereKeyNot($article->id)->exists()) {
                return $this->error('ARTICLE_SLUG_CONFLICT', 'An article with this slug already exists.', 409);
            }
            $data['slug'] = $slug;
        }
        $article->update($this->attributes($data, $data['categoryId'] ?? $article->category_id, $article->author_id, $data['slug'] ?? $article->slug, $data['status'] ?? $article->status->value, $article));

        return response()->json(['success' => true, 'data' => (new ArticleResource($article->refresh()->load(['category:id,name,slug,color', 'author:id,name'])))->resolve()]);
    }

    public function destroy(string $id): JsonResponse
    {
        $article = Article::with(['category:id,name,slug,color', 'author:id,name'])->find($id);
        if (! $article) {
            return $this->error('ARTICLE_NOT_FOUND', 'Article not found.', 404);
        }
        $data = (new ArticleResource($article))->resolve();
        $article->delete();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $article = Article::query()
            ->currentlyPublishable()
            ->where('slug', Slug::normalize($slug))
            ->first();
        if (! $article) {
            return $this->error('ARTICLE_NOT_FOUND', 'Article not found.', 404);
        }
        $article->increment('views');
        $article->refresh()->load(['category:id,name,slug,color', 'author:id,name']);

        return response()->json(['success' => true, 'data' => (new ArticleResource($article))->resolve()]);
    }

    private function activeCategory(string $id): ?Category
    {
        return Category::whereKey($id)->where('is_active', true)->first();
    }

    private function availableSlug(string $slug): string
    {
        $candidate = $slug;
        $n = 2;
        while (Article::where('slug', $candidate)->exists()) {
            $candidate = $slug.'-'.$n++;
        }

        return $candidate;
    }

    private function attributes(array $data, string $categoryId, string $authorId, string $slug, string $status, ?Article $existing = null): array
    {
        $publishedAt = array_key_exists('publishedAt', $data) ? $data['publishedAt'] : $existing?->published_at;
        if ($status === ArticleStatus::DRAFT->value) {
            $publishedAt = null;
        }
        if ($status === ArticleStatus::PUBLISHED->value && $publishedAt === null) {
            $publishedAt = now();
        }

        return array_filter([
            'title' => $data['title'] ?? $existing?->title, 'slug' => $slug, 'excerpt' => $data['excerpt'] ?? $existing?->excerpt, 'content' => $data['content'] ?? $existing?->content,
            'featured_image' => $data['featuredImage'] ?? $existing?->featured_image, 'featured_image_alt' => $data['featuredImageAlt'] ?? $existing?->featured_image_alt, 'youtube_url' => $data['youtubeUrl'] ?? $existing?->youtube_url,
            'status' => $status, 'is_featured' => $data['isFeatured'] ?? $existing?->is_featured ?? false, 'is_breaking' => $data['isBreaking'] ?? $existing?->is_breaking ?? false,
            'published_at' => $publishedAt, 'category_id' => $categoryId, 'author_id' => $authorId, 'meta_title' => $data['metaTitle'] ?? $existing?->meta_title, 'meta_description' => $data['metaDescription'] ?? $existing?->meta_description,
        ], fn ($v) => $v !== null || $existing === null);
    }

    private function error(string $code, string $message, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'error' => ['code' => $code, 'message' => $message, 'details' => []]], $status);
    }
}
