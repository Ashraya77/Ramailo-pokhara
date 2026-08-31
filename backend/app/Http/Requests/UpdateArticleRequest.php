<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;

class UpdateArticleRequest extends StoreArticleRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['title'][0] = 'sometimes';
        $rules['content'][0] = 'sometimes';
        $rules['categoryId'][0] = 'sometimes';

        foreach (['slug', 'excerpt', 'featuredImage', 'featuredImageAlt', 'youtubeUrl', 'publishedAt', 'metaTitle', 'metaDescription'] as $field) {
            array_unshift($rules[$field], 'sometimes');
        }

        return $rules;
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $this->validateArticleFields($validator, false);
        }];
    }
}
