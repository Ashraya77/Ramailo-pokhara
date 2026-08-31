<?php

namespace App\Http\Requests;

use App\Enums\ArticleStatus;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreArticleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->isJson() || $this->getContent() === '') {
            return;
        }

        try {
            json_decode($this->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'error' => ['code' => 'MALFORMED_JSON', 'message' => 'The request body contains malformed JSON.', 'details' => []],
            ], 400));
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string'],
            'slug' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'featuredImage' => ['nullable', 'string'],
            'featuredImageAlt' => ['nullable', 'string'],
            'youtubeUrl' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::enum(ArticleStatus::class)],
            'isFeatured' => ['sometimes', 'boolean'],
            'isBreaking' => ['sometimes', 'boolean'],
            'publishedAt' => ['nullable', 'date'],
            'categoryId' => ['required', 'string'],
            'metaTitle' => ['nullable', 'string'],
            'metaDescription' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $this->validateArticleFields($validator, true);
        }];
    }

    protected function validateArticleFields(Validator $validator, bool $creating): void
    {
        $allowed = ['title', 'slug', 'excerpt', 'content', 'featuredImage', 'featuredImageAlt', 'youtubeUrl', 'status', 'isFeatured', 'isBreaking', 'publishedAt', 'categoryId', 'metaTitle', 'metaDescription'];
        $unexpected = array_values(array_diff(array_keys($this->all()), $allowed));

        if ($unexpected !== []) {
            $validator->errors()->add('payload', 'Unexpected fields: '.implode(', ', $unexpected).'.');
        }

        if (! $creating && $this->all() === []) {
            $validator->errors()->add('payload', 'At least one field is required.');
        }

        foreach ([['title', 5, 200], ['slug', null, 220], ['excerpt', null, 500], ['featuredImageAlt', null, 200], ['metaTitle', null, 70], ['metaDescription', null, 170]] as [$field, $minimum, $maximum]) {
            $this->validateGraphemeLength($validator, $field, $minimum, $maximum);
        }

        if ($this->has('content') && is_string($this->input('content')) && $this->visibleText($this->input('content')) === '') {
            $validator->errors()->add('content', 'The content must contain visible text.');
        }

        if ($this->has('featuredImage') && $this->input('featuredImage') !== null && ! $this->isSafeImageLocation($this->input('featuredImage'))) {
            $validator->errors()->add('featuredImage', 'The featured image must be an HTTP(S) URL or safe absolute local path.');
        }

        if ($this->has('youtubeUrl') && $this->input('youtubeUrl') !== null && ! $this->isYoutubeUrl($this->input('youtubeUrl'))) {
            $validator->errors()->add('youtubeUrl', 'The YouTube URL is invalid.');
        }
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'error' => ['code' => 'VALIDATION_ERROR', 'message' => 'The given data was invalid.', 'details' => $validator->errors()->toArray()],
        ], 400));
    }

    private function validateGraphemeLength(Validator $validator, string $field, ?int $minimum, int $maximum): void
    {
        $value = $this->input($field);

        if (! is_string($value)) {
            return;
        }

        $length = function_exists('grapheme_strlen') ? grapheme_strlen($value) : mb_strlen($value);

        if (($minimum !== null && $length < $minimum) || $length > $maximum) {
            $validator->errors()->add($field, "The {$field} must be between {$minimum} and {$maximum} characters.");
        }
    }

    private function visibleText(string $content): string
    {
        return trim((string) preg_replace('/[\p{Z}\s]+/u', '', html_entity_decode(strip_tags($content), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
    }

    private function isSafeImageLocation(mixed $value): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        if (filter_var($value, FILTER_VALIDATE_URL) && in_array(strtolower((string) parse_url($value, PHP_URL_SCHEME)), ['http', 'https'], true)) {
            return true;
        }

        return str_starts_with($value, '/') && ! str_starts_with($value, '//') && ! str_contains($value, '\\') && ! preg_match('#(^|/)\.\.(/|$)#', $value);
    }

    private function isYoutubeUrl(mixed $value): bool
    {
        if (! is_string($value) || ! filter_var($value, FILTER_VALIDATE_URL)) {
            return false;
        }

        $parts = parse_url($value);
        $host = strtolower((string) ($parts['host'] ?? ''));
        $path = (string) ($parts['path'] ?? '');

        if (! in_array(strtolower((string) ($parts['scheme'] ?? '')), ['http', 'https'], true)) {
            return false;
        }

        if (in_array($host, ['youtube.com', 'www.youtube.com'], true)) {
            return (str_starts_with($path, '/embed/') && strlen($path) > 7) || ($path === '/watch' && isset($parts['query']) && str_contains($parts['query'], 'v='));
        }

        return in_array($host, ['youtu.be', 'www.youtu.be'], true) && strlen(trim($path, '/')) > 0;
    }
}
