<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
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
                'error' => [
                    'code' => 'MALFORMED_JSON',
                    'message' => 'The request body contains malformed JSON.',
                    'details' => [],
                ],
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
            'name' => ['required', 'string', Rule::unique('categories', 'name')],
            'slug' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
            'isActive' => ['sometimes', 'boolean'],
            'sortOrder' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $this->validatePayload($validator, ['name', 'slug', 'description', 'color', 'isActive', 'sortOrder']);

            $this->validateGraphemeLength($validator, 'name', 2, 80);
            $this->validateGraphemeLength($validator, 'slug', null, 100);
            $this->validateGraphemeLength($validator, 'description', null, 500);
        }];
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'error' => [
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid.',
                'details' => $validator->errors()->toArray(),
            ],
        ], 400));
    }

    private function validatePayload(Validator $validator, array $allowed): void
    {
        $unexpected = array_values(array_diff(array_keys($this->all()), $allowed));

        if ($unexpected !== []) {
            $validator->errors()->add('payload', 'Unexpected fields: '.implode(', ', $unexpected).'.');
        }
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
}
