# API Map

All paths are prefixed with `/api`. Successful responses use `{ "success": true, "data": ... }`. API errors use `{ "success": false, "error": { "code", "message", "details" } }`. API middleware returns `MALFORMED_JSON` with 400 for malformed JSON and `UNAUTHENTICATED` with 401 for missing Sanctum authentication.

## Resource shapes

### Article

`id, title, slug: string`; `excerpt, featuredImage, featuredImageAlt, youtubeUrl, publishedAt, metaTitle, metaDescription, createdAt, updatedAt: string | null`; `content: string`; `status: "DRAFT" | "PUBLISHED" | "ARCHIVED"`; `isFeatured, isBreaking: boolean`; `views: number`; `category: { id, name, slug: string; color: string | null }`; `author: { id, name: string }`.

### Category

`id, name, slug: string`; `description, color, createdAt, updatedAt: string | null`; `isActive: boolean`; `sortOrder: number`; `_count: { articles: number }`.

Timestamps are ISO-8601. Field names above exactly match `ArticleResource` and `CategoryResource`.

## Authentication

### POST /auth/login — public

Body: `email` (required string, valid email); `password` (required string, 1–128 characters).

Success 200: `data.user = { id, name, email, role: "ADMIN" }`; `data.token: string`.

Errors: `MALFORMED_JSON` 400; default Laravel validation response 422; `UNAUTHENTICATED` 401 for unknown/invalid, inactive, or non-admin credentials.

### GET /auth/me — auth:sanctum

No body. Success 200: `data.user = { id, name, email, role: "ADMIN" }`. Errors: `UNAUTHENTICATED` 401.

### POST /auth/logout — auth:sanctum

No body. Deletes the current token when present. Success 200: `{ success: true, message: "Logged out successfully." }`. Errors: `UNAUTHENTICATED` 401.

## Categories

### GET /categories — public

Query fields: `active` optional and exactly `true` or `false`; `search` optional, trimmed, maximum 100 grapheme characters.

Success 200: `data: Category[]`. Errors: `VALIDATION_ERROR` 400.

### GET /categories/{id} — public

`id` is a string path parameter. Success 200: `data: Category`. Errors: `CATEGORY_NOT_FOUND` 404.

### POST /categories — auth:sanctum + admin

| Field | Type | Validation / behavior |
| --- | --- | --- |
| `name` | string | Required; 2–80 grapheme characters; unique. |
| `slug` | string or null | Nullable; max 100 grapheme characters; normalized. Missing/empty uses `name`; empty normalized value is invalid; duplicates receive a numeric suffix. |
| `description` | string or null | Nullable; max 500 grapheme characters. |
| `color` | string or null | Nullable; exactly `#` plus six hexadecimal digits. |
| `isActive` | boolean | Optional; defaults to true. |
| `sortOrder` | integer | Optional; min 0; defaults to 0. |

Unknown fields are rejected. Success 201: `data: Category`.

Errors: `MALFORMED_JSON` 400; `VALIDATION_ERROR` 400; `INVALID_SLUG` 400; `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `CATEGORY_CONFLICT` 409; `INTERNAL_SERVER_ERROR` 500.

### PATCH /categories/{id} — auth:sanctum + admin

`id` is string. At least one and only these optional fields are accepted: `name` (string, 2–80 grapheme characters, unique except the current category); `slug` (nullable string, max 100, normalized; empty uses supplied or current name); `description` (nullable string, max 500); `color` (nullable `#RRGGBB`); `isActive` (boolean); `sortOrder` (integer, min 0).

Success 200: `data: Category`.

Errors: `MALFORMED_JSON` 400; `VALIDATION_ERROR` 400; `INVALID_SLUG` 400; `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `CATEGORY_NOT_FOUND` 404; `CATEGORY_CONFLICT` 409; `INTERNAL_SERVER_ERROR` 500.

### DELETE /categories/{id} — auth:sanctum + admin

No body. Success 200: `data: Category` before deletion.

Errors: `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `CATEGORY_NOT_FOUND` 404; `CATEGORY_IN_USE` 409 with `error.details.articleCount: number`.

## Articles

### GET /articles — public, with conditional admin expansion

`admin=true` expands results only for an authenticated active admin; other callers remain public. Public results have `PUBLISHED` status, non-null/non-future `publishedAt`, and active author/category.

| Query field | Type | Validation / default |
| --- | --- | --- |
| `page` | integer-like string | Min 1; default 1. |
| `limit` | integer-like string | 1–50; default 10. |
| `admin` | string | Only exact `true` affects an active authenticated admin. |
| `status` | string | Admin mode only: `DRAFT`, `PUBLISHED`, `ARCHIVED`. |
| `featured`, `breaking` | string | Each exactly `true` or `false`. |
| `search` | string | Trimmed; maximum 200 grapheme chars; matches title/excerpt. |
| `category`, `categoryId` | string | Slug / ID; mutually exclusive. |
| `sort` | string | `publishedAt`, `createdAt`, `updatedAt`, `title`, or `views`; default `publishedAt` publicly, `updatedAt` in admin mode. |
| `order` | string | `asc` or `desc`; default `desc`. |

Success 200: `data: Article[]`; `meta: { page, limit, total, totalPages: number; hasNextPage, hasPreviousPage: boolean }`.

Errors: `VALIDATION_ERROR` 400.

### GET /articles/slug/{slug} — public

Normalizes `slug`, returns only a currently publishable article, then increments `views`. Success 200: `data: Article`. Errors: `ARTICLE_NOT_FOUND` 404.

### GET /articles/{id} — auth:sanctum + admin

No body. Success 200: `data: Article`. Errors: `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `ARTICLE_NOT_FOUND` 404.

### POST /articles — auth:sanctum + admin

| Field | Type | Validation / behavior |
| --- | --- | --- |
| `title` | string | Required; 5–200 grapheme characters. |
| `slug` | string or null | Nullable; max 220; normalized. Missing derives from title; empty derived value generates `news-YYYYMMDD-xxxxxx`; duplicates get numeric suffix. |
| `excerpt` | string or null | Nullable; max 500 grapheme characters. |
| `content` | string | Required; must retain visible text after HTML/entities/whitespace are stripped. |
| `featuredImage` | string or null | Nullable; HTTP(S) URL or safe absolute local path: one leading slash, no `//`, backslash, or `..`. |
| `featuredImageAlt` | string or null | Nullable; max 200 grapheme characters. |
| `youtubeUrl` | string or null | Nullable; HTTP(S) YouTube embed/watch URL or non-empty youtu.be path. |
| `status` | string | Optional: `DRAFT`, `PUBLISHED`, `ARCHIVED`; defaults to `DRAFT`. |
| `isFeatured`, `isBreaking` | boolean | Optional; each defaults false. |
| `publishedAt` | date string or null | Nullable valid date; DRAFT forces null; PUBLISHED null/missing uses now. |
| `categoryId` | string | Required; must identify an active category. |
| `metaTitle`, `metaDescription` | string or null | Nullable; max 70 / 170 grapheme characters. |

Unknown fields are rejected; the authenticated user becomes author. Success 201: `data: Article`.

Errors: `MALFORMED_JSON` 400; `VALIDATION_ERROR` 400; `INVALID_CATEGORY` 400; `UNAUTHENTICATED` 401; `FORBIDDEN` 403.

### PATCH /articles/{id} — auth:sanctum + admin

`id` is string. At least one field and no unknown fields are allowed. Every POST article field is optional with the same rules. A supplied `categoryId` must be active. A supplied slug is normalized: empty causes `INVALID_SLUG`; duplicate causes `ARTICLE_SLUG_CONFLICT` rather than suffixing. DRAFT forces null `publishedAt`; PUBLISHED null uses now.

Success 200: `data: Article`.

Errors: `MALFORMED_JSON` 400; `VALIDATION_ERROR` 400; `INVALID_CATEGORY` 400; `INVALID_SLUG` 400; `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `ARTICLE_NOT_FOUND` 404; `ARTICLE_SLUG_CONFLICT` 409.

### DELETE /articles/{id} — auth:sanctum + admin

No body. Success 200: `data: Article` before deletion.

Errors: `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `ARTICLE_NOT_FOUND` 404.
