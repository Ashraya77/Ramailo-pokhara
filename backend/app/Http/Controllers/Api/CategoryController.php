<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\Slug;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $active = $request->query('active');

        if ($active !== null && ! in_array($active, ['true', 'false'], true)) {
            return $this->error('VALIDATION_ERROR', 'The active parameter must be true or false.', 400, [
                'active' => ['The active parameter must be true or false.'],
            ]);
        }

        $search = trim((string) $request->query('search', ''));

        if ((function_exists('grapheme_strlen') ? grapheme_strlen($search) : mb_strlen($search)) > 100) {
            return $this->error('VALIDATION_ERROR', 'The search parameter may not be greater than 100 characters.', 400, [
                'search' => ['The search parameter may not be greater than 100 characters.'],
            ]);
        }

        $categories = Category::query()
            ->withCount('articles')
            ->when($active !== null, fn ($query) => $query->where('is_active', $active === 'true'))
            ->when($search !== '', function ($query) use ($search): void {
                $term = '%'.mb_strtolower($search).'%';

                $query->where(function ($query) use ($term): void {
                    $query->whereRaw('LOWER(name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$term]);
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories)->resolve(),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $slug = $this->normalizedSlug(($validated['slug'] ?? null) ?: $validated['name']);

        if ($slug === null) {
            return $this->error('INVALID_SLUG', 'The category slug is invalid.', 400);
        }

        try {
            $category = Category::create([
                'name' => $validated['name'],
                'slug' => $this->availableSlug($slug),
                'description' => $validated['description'] ?? null,
                'color' => $validated['color'] ?? null,
                'is_active' => $validated['isActive'] ?? true,
                'sort_order' => $validated['sortOrder'] ?? 0,
            ]);
        } catch (QueryException $exception) {
            return $this->error('CATEGORY_CONFLICT', 'A category with this name or slug already exists.', 409);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('INTERNAL_SERVER_ERROR', 'Unable to create the category.', 500);
        }

        $category->loadCount('articles');

        return response()->json([
            'success' => true,
            'data' => (new CategoryResource($category))->resolve(),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $category = Category::withCount('articles')->find($id);

        if ($category === null) {
            return $this->error('CATEGORY_NOT_FOUND', 'Category not found.', 404);
        }

        return response()->json([
            'success' => true,
            'data' => (new CategoryResource($category))->resolve(),
        ]);
    }

    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        $category = Category::withCount('articles')->find($id);

        if ($category === null) {
            return $this->error('CATEGORY_NOT_FOUND', 'Category not found.', 404);
        }

        $validated = $request->validated();
        $attributes = [];

        foreach (['name', 'description', 'color'] as $field) {
            if (array_key_exists($field, $validated)) {
                $attributes[$field] = $validated[$field];
            }
        }

        if (array_key_exists('isActive', $validated)) {
            $attributes['is_active'] = $validated['isActive'];
        }

        if (array_key_exists('sortOrder', $validated)) {
            $attributes['sort_order'] = $validated['sortOrder'];
        }

        if (array_key_exists('slug', $validated)) {
            $slug = $this->normalizedSlug($validated['slug'] ?: ($validated['name'] ?? $category->name));

            if ($slug === null) {
                return $this->error('INVALID_SLUG', 'The category slug is invalid.', 400);
            }

            if (Category::where('slug', $slug)->whereKeyNot($category->id)->exists()) {
                return $this->error('CATEGORY_CONFLICT', 'A category with this slug already exists.', 409);
            }

            $attributes['slug'] = $slug;
        }

        try {
            $category->update($attributes);
        } catch (QueryException $exception) {
            return $this->error('CATEGORY_CONFLICT', 'A category with this name or slug already exists.', 409);
        } catch (Throwable $exception) {
            report($exception);

            return $this->error('INTERNAL_SERVER_ERROR', 'Unable to update the category.', 500);
        }

        $category->loadCount('articles');

        return response()->json([
            'success' => true,
            'data' => (new CategoryResource($category))->resolve(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        return DB::transaction(function () use ($id): JsonResponse {
            $category = Category::query()->withCount('articles')->lockForUpdate()->find($id);

            if ($category === null) {
                return $this->error('CATEGORY_NOT_FOUND', 'Category not found.', 404);
            }

            if ($category->articles_count > 0) {
                return $this->error('CATEGORY_IN_USE', 'The category is in use and cannot be deleted.', 409, [
                    'articleCount' => $category->articles_count,
                ]);
            }

            $resource = (new CategoryResource($category))->resolve();
            $category->delete();

            return response()->json([
                'success' => true,
                'data' => $resource,
            ]);
        });
    }

    private function normalizedSlug(string $value): ?string
    {
        $slug = Slug::normalize($value);

        return $slug === '' ? null : $slug;
    }

    private function availableSlug(string $slug): string
    {
        $candidate = $slug;
        $suffix = 2;

        while (Category::where('slug', $candidate)->exists()) {
            $candidate = $slug.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function error(string $code, string $message, int $status, array $details = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => $details,
            ],
        ], $status);
    }
}
