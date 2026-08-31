<?php

namespace App\Models;

use App\Enums\ArticleStatus;
use App\Support\Cuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'featured_image_alt', 'youtube_url', 'status', 'is_featured', 'is_breaking', 'published_at', 'views', 'meta_title', 'meta_description', 'category_id', 'author_id'];

    protected static function booted(): void
    {
        static::creating(function (self $article): void {
            if ($article->getKey() === null) {
                $article->setAttribute($article->getKeyName(), Cuid::generate());
            }
        });
    }

    protected function casts(): array
    {
        return ['status' => ArticleStatus::class, 'is_featured' => 'boolean', 'is_breaking' => 'boolean', 'published_at' => 'datetime', 'views' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Constrain the query to articles that are currently visible to the public.
     *
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function scopeCurrentlyPublishable(Builder $query): Builder
    {
        return $query
            ->where('status', ArticleStatus::PUBLISHED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereHas('author', fn (Builder $query): Builder => $query->where('is_active', true))
            ->whereHas('category', fn (Builder $query): Builder => $query->where('is_active', true));
    }
}
