<?php

namespace App\Models;

use App\Support\Cuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'name', 'slug', 'description', 'color', 'is_active', 'sort_order'];

    protected static function booted(): void
    {
        static::creating(function (self $category): void {
            if ($category->getKey() === null) {
                $category->setAttribute($category->getKeyName(), Cuid::generate());
            }
        });
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer', 'created_at' => 'datetime', 'updated_at' => 'datetime'];
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'category_id');
    }
}
