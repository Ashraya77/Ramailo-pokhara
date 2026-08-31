<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'title' => $this->title, 'slug' => $this->slug,
            'excerpt' => $this->excerpt, 'content' => $this->content,
            'featuredImage' => $this->featured_image, 'featuredImageAlt' => $this->featured_image_alt,
            'youtubeUrl' => $this->youtube_url, 'status' => $this->status->value,
            'isFeatured' => $this->is_featured, 'isBreaking' => $this->is_breaking,
            'publishedAt' => $this->published_at?->toISOString(), 'views' => $this->views,
            'metaTitle' => $this->meta_title, 'metaDescription' => $this->meta_description,
            'createdAt' => $this->created_at?->toISOString(), 'updatedAt' => $this->updated_at?->toISOString(),
            'category' => $this->whenLoaded('category', fn (): array => ['id' => $this->category->id, 'name' => $this->category->name, 'slug' => $this->category->slug, 'color' => $this->category->color]),
            'author' => $this->whenLoaded('author', fn (): array => ['id' => $this->author->id, 'name' => $this->author->name]),
        ];
    }
}
