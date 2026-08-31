1. Executive Summary
The /frontend backend is a Next.js 16 App Router application with:
- PostgreSQL via Prisma 7 and @prisma/adapter-pg
- Auth.js / NextAuth v5 credentials authentication
- One ADMIN role only
- Local-disk image upload/storage under public/uploads/articles
- JSON REST-style routes for articles, categories, and images
- Server-side direct Prisma reads for public pages, RSS, sitemap, and parts of the admin UI
There are three database models: User, Category, and Article. The application has no public registration, password reset, email verification, payments, email service, or scheduled jobs.
2. Project/Backend Architecture
- Framework: Next.js 16.2.10, React 19.2.4, TypeScript.
- Routing: App Router (app/api/**/route.ts), not Pages Router.
- API implementation: Next.js Route Handlers.
- ORM/database: Prisma 7.8, PostgreSQL provider, pg driver via PrismaPg.
- Validation: Zod 4 schemas, used in API handlers and login server action.
- Password hashing: bcryptjs, cost factor 12 during seed creation.
- Authentication: NextAuth/Auth.js v5 credentials provider, JWT session strategy, 8-hour lifetime.
- Middleware/proxy: proxy.ts exports Auth.js authorization logic for /admin/:path*.
- API authorization: API mutations independently call authorizeAdmin(), which verifies:
  1. A NextAuth session exists.
  2. Session role is ADMIN.
  3. The database user still exists, is active, and remains ADMIN.
- Error format is centralized:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
Successful JSON responses are:
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "meta": {}
}
- Background-like work: the public article page uses Next.js after() to increment views after rendering. RSS and sitemap are statically revalidated every 900 seconds.
- No queue, cron, worker, webhook, or scheduled process was found.
3. Complete API Endpoint Inventory
All JSON API responses use the envelope above unless noted otherwise. Dates serialize as ISO-8601 strings in HTTP JSON responses.
Method	Route	Auth / role	Purpose / success
GET	/api/articles	Public by default	Lists public published articles; 200 with article summaries and pagination metadata.
POST	/api/articles	Active ADMIN	Creates an article; 201 with full article, including content.
GET	/api/articles/:id	Active ADMIN	Gets any article by ID; 200 full article.
PATCH	/api/articles/:id	Active ADMIN	Updates an article; 200 full article.
DELETE	/api/articles/:id	Active ADMIN	Deletes an article record; 200 deleted full article.
GET	/api/articles/slug/:slug	Public	Gets a currently publishable article by slug and increments views; 200 full article.
GET	/api/categories	Public	Lists categories, including inactive categories unless filtered; 200.
POST	/api/categories	Active ADMIN	Creates a category; 201.
GET	/api/categories/:id	Public	Gets a category by ID, including inactive categories; 200.
PATCH	/api/categories/:id	Active ADMIN	Updates category; 200.
DELETE	/api/categories/:id	Active ADMIN	Deletes an unused category; 200.
POST	/api/uploads/images	Active ADMIN	Uploads, validates, converts, and locally stores an image; 201.
DELETE	/api/uploads/images	Active ADMIN	Deletes an unreferenced managed image; 200.
GET / POST	/api/auth/[...nextauth]	NextAuth-managed	Catch-all Auth.js endpoint for CSRF, session, credentials callback, sign-in/out, etc.
GET	/uploads/articles/:filename	Public	Serves a managed WebP upload as binary image data.
GET	/rss.xml	Public	RSS 2.0 feed, XML rather than JSON.
GET	/sitemap.xml	Public	Next.js metadata route; generated sitemap XML.
GET	/robots.txt	Public	Next.js metadata route; generated robots.txt.


Articles
GET /api/articles
Query parameters:
Parameter	Type / rules	Effect
page	integer, minimum 1, default 1	Pagination page.
limit	integer 1–50, default 10	Page size.
search	trimmed string, max 200	Case-insensitive title or excerpt search.
category	non-empty string	Public: category slug filter; admin: category slug filter.
categoryId	non-empty string	Direct category ID filter. Cannot be combined with category.
status	DRAFT, PUBLISHED, ARCHIVED	Only applied to admin listing.
featured	"true" / "false"	Filters isFeatured.
breaking	"true" / "false"	Filters isBreaking.
sort	publishedAt, createdAt, updatedAt, title, views	Ordering field.
order	asc, desc	Defaults to desc.
admin	"true" / "false"	Requests admin-mode listing if caller is authorized.


Public listing only returns articles where:
- status = PUBLISHED
- publishedAt <= now
- publishedAt IS NOT NULL
- author is active
- category is active
Default public ordering is publishedAt DESC; default admin ordering is updatedAt DESC.
Response:
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string|null",
      "featuredImage": "string|null",
      "featuredImageAlt": "string|null",
      "youtubeUrl": "string|null",
      "status": "DRAFT|PUBLISHED|ARCHIVED",
      "isFeatured": false,
      "isBreaking": false,
      "publishedAt": "ISO date|null",
      "views": 0,
      "metaTitle": "string|null",
      "metaDescription": "string|null",
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "category": { "id": "cuid", "name": "string", "slug": "string", "color": "string|null" },
      "author": { "id": "cuid", "name": "string" }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
POST /api/articles and PATCH /api/articles/:id
- Expected header: Content-Type: application/json in normal client use. The handler parses JSON but does not explicitly enforce this header.
- Path parameter: id, unvalidated string passed to Prisma.
- Create request requires title, content, and categoryId.
- Create defaults: status: DRAFT, isFeatured: false, isBreaking: false.
- Update accepts one or more allowed fields only.
Article body fields:
Field	Rules
title	Required on create; 5–200 graphemes.
slug	Optional; max 220 graphemes; normalized server-side.
excerpt	Nullable; max 500 graphemes.
content	Required on create; must contain visible text after simple HTML stripping.
featuredImage	Nullable; HTTP(S) URL or safe absolute local path.
featuredImageAlt	Nullable; max 200 graphemes.
youtubeUrl	Nullable; HTTP(S) YouTube, youtu.be, youtube.com/watch?v=, or /embed/ URL only.
status	DRAFT, PUBLISHED, ARCHIVED.
isFeatured, isBreaking	Boolean.
publishedAt	Nullable ISO datetime with timezone offset.
categoryId	Required on create; non-empty string and must reference an active category.
metaTitle	Nullable; max 70 graphemes.
metaDescription	Nullable; max 170 graphemes.


Business behavior:
- Slugs are lowercased ASCII URL slugs. Devanagari text is transliterated before slugification.
- A missing/unusable create slug gets a fallback such as news-YYYYMMDD-random.
- Create automatically appends -2, -3, etc. to resolve existing slug collisions.
- Update rejects slug collisions with 409; it does not auto-suffix.
- Publishing an article without publishedAt assigns the current time.
- Changing PUBLISHED → DRAFT clears publishedAt.
- Changing to ARCHIVED preserves the existing publishedAt.
- Create/update return the article including content.
Possible errors: 400 VALIDATION_ERROR, 400 MALFORMED_JSON, 400 INVALID_CATEGORY, 400 INVALID_RELATION, 400 INVALID_SLUG, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 ARTICLE_NOT_FOUND, 409 ARTICLE_SLUG_CONFLICT, 500 INTERNAL_SERVER_ERROR.
GET /api/articles/:id has the same 401, 403, 404, and 500 possibilities.
DELETE /api/articles/:id deletes the database record only. It does not remove its featured-image file.
GET /api/articles/slug/:slug
- The path slug is normalized using the same slugifier.
- Returns only a currently visible published article.
- Increments views atomically after lookup.
- Returns 404 ARTICLE_NOT_FOUND for invalid, missing, draft, archived, scheduled, inactive-author, or inactive-category articles.
Categories
GET /api/categories
Optional query parameters:
- active: "true" or "false"
- search: trimmed, max 100 characters; case-insensitive name/description search
Ordered by sortOrder ASC, then name ASC. Each result includes every Category field plus:
"_count": { "articles": 0 }
POST /api/categories, PATCH /api/categories/:id
JSON body fields:
Field	Rules
name	Required on create; 2–80 graphemes; unique.
slug	Optional; max 100 graphemes; normalized server-side; unique.
description	Nullable; max 500 graphemes.
color	Nullable #RRGGBB.
isActive	Boolean; create default true.
sortOrder	Non-negative integer; create default 0.


Creation auto-suffixes colliding slugs, but update returns a conflict. Responses use category objects plus _count.articles.
Possible errors: 400 VALIDATION_ERROR, 400 MALFORMED_JSON, 400 INVALID_SLUG, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 CATEGORY_NOT_FOUND, 409 CATEGORY_CONFLICT, 409 CATEGORY_IN_USE, 500 INTERNAL_SERVER_ERROR.
DELETE /api/categories/:id
- Runs in a Prisma transaction.
- Returns 409 CATEGORY_IN_USE with { "articleCount": number } when referenced by any article.
- The database foreign key also restricts category deletion.
Image uploads
POST /api/uploads/images
- Requires an authenticated active admin.
- Required header: Content-Type: multipart/form-data; boundary=....
- Required field: file.
- Request body limit: MAX_IMAGE_UPLOAD_MB + 1 MiB; default image limit is 5 MiB.
- Accepted declared MIME/extension combinations:
  - JPEG: image/jpeg + .jpg/.jpeg
  - PNG: image/png + .png
  - WebP: image/webp + .webp
- Image contents are independently decoded/verified with Sharp.
- Animated/multi-page images are rejected.
- Input pixel limit: 40,000,000.
- Images are autorotated, resized to maximum width 1920 without enlargement, converted to WebP quality 82, and written as a UUID v4 .webp file.
Success data:
{
  "url": "/uploads/articles/uuid-v4.webp",
  "filename": "uuid-v4.webp",
  "mimeType": "image/webp",
  "size": 12345,
  "width": 1920,
  "height": 1080
}
Errors include: 400 FILE_REQUIRED, 400 INVALID_MULTIPART, 400 INVALID_IMAGE_PATH, 413 FILE_TOO_LARGE, 415 UNSUPPORTED_MEDIA_TYPE, 422 INVALID_IMAGE, 409 IMAGE_IN_USE, 404 IMAGE_NOT_FOUND, 500 UPLOAD_FAILED, 500 DELETE_FAILED.
DELETE /api/uploads/images
- JSON body: { "url": "/uploads/articles/uuid-v4.webp" }.
- Only accepts a managed UUID-v4 WebP path.
- Refuses deletion if any article currently uses that exact path as featuredImage.
GET /uploads/articles/:filename
- Public, no parameters except filename.
- Returns the binary WebP data with:
  - Content-Type: image/webp
  - Cache-Control: public, max-age=3600
  - X-Content-Type-Options: nosniff
- Uses strict filename and filesystem checks to reject traversal/symlink access.
Auth.js
The catch-all handler delegates to Auth.js. Code and api.http demonstrate these concrete paths:
Method	Route	Purpose
GET	/api/auth/csrf	Returns CSRF token for form-based Auth.js flows.
POST	/api/auth/callback/credentials	Validates credentials and creates the session cookie.
GET	/api/auth/session	Returns current session.


Auth.js also conventionally handles provider, sign-in, sign-out, error, and callback variants under /api/auth/*; their exact generated route/method matrix is framework-managed rather than explicitly authored here. Needs verification against the deployed Auth.js beta runtime if Laravel must mimic every auxiliary Auth.js response exactly.
RSS, sitemap, robots
- /rss.xml: latest 30 currently publishable articles; RSS XML; cache policy s-maxage=900, stale-while-revalidate 3600.
- /sitemap.xml: active categories and currently publishable articles; revalidates every 900 seconds.
- /robots.txt: disallows crawlers from /admin and /api.
4. Authentication & Authorization
There is no registration endpoint. Users are created by the Prisma seed process.
Login flow:
1. Admin submits email/password to the /admin/login server action.
2. The server action runs loginSchema:
   - email trimmed, valid email, lowercased
   - password 1–128 characters
3. It calls signIn("credentials", { redirect: false }).
4. The credentials provider queries the user by email.
5. It rejects absent or inactive users.
6. bcrypt.compare() verifies the supplied password against passwordHash.
7. Successful login updates lastLoginAt.
8. The JWT callback adds id and role to the token.
9. The session callback exposes session.user.id and session.user.role only when the role is ADMIN.
10. The user is redirected to /admin.
Session details:
- Strategy: JWT.
- Maximum age: 8 hours.
- No refresh token.
- No token persistence table.
- No explicit logout endpoint authored by the app; signOut() uses Auth.js.
- No password reset, account verification, OAuth, MFA, or email verification.
- AUTH_SECRET exists in .env; it is not directly read in source, but Auth.js conventionally consumes it.
Authorization:
- proxy.ts applies Auth.js authorization to /admin/:path*.
- /admin/login remains accessible.
- Other /admin pages require a JWT session with role ADMIN.
- Protected API routes call authorizeAdmin() and re-query the database, so disabling an account or changing its role revokes API access even when an old JWT still exists.
- Public API routes do not require a session.
5. Database Schema
Database: PostgreSQL, Prisma schema at prisma/schema.prisma. One initial migration creates all tables and enums.
User (1) ───< Article >─── (1) Category
User
Field	Type / rules
id	TEXT, primary key, Prisma CUID default.
name	Required TEXT.
email	Required TEXT, unique.
passwordHash	Required TEXT.
role	PostgreSQL enum UserRole; only ADMIN; default ADMIN.
isActive	Required boolean; default true.
lastLoginAt	Nullable timestamp(3).
createdAt	Required timestamp(3); default current timestamp.
updatedAt	Required timestamp(3); managed by Prisma @updatedAt.


Indexes: unique email, plus a redundant non-unique index on email.
Category
Field	Type / rules
id	TEXT, primary key, CUID default.
name	Required TEXT, unique.
slug	Required TEXT, unique.
description	Nullable TEXT.
color	Nullable TEXT.
isActive	Required boolean; default true.
sortOrder	Required integer; default 0.
createdAt	Required timestamp(3); default current timestamp.
updatedAt	Required timestamp(3); Prisma-managed.


Indexes: unique name, unique slug, redundant non-unique slug, composite (isActive, sortOrder).
Article
Field	Type / rules
id	TEXT, primary key, CUID default.
title	Required TEXT.
slug	Required TEXT, unique.
excerpt	Nullable TEXT.
content	Required PostgreSQL TEXT.
featuredImage	Nullable TEXT.
featuredImageAlt	Nullable TEXT.
youtubeUrl	Nullable TEXT.
status	PostgreSQL enum ArticleStatus: DRAFT, PUBLISHED, ARCHIVED; default DRAFT.
isFeatured	Required boolean; default false.
isBreaking	Required boolean; default false.
publishedAt	Nullable timestamp(3).
views	Required integer; default 0.
metaTitle	Nullable TEXT.
metaDescription	Nullable TEXT.
categoryId	Required TEXT foreign key to Category.id.
authorId	Required TEXT foreign key to User.id.
createdAt	Required timestamp(3); default current timestamp.
updatedAt	Required timestamp(3); Prisma-managed.


Indexes:
- unique slug
- (status, publishedAt)
- (categoryId, status, publishedAt)
- authorId
- (isFeatured, status)
- (isBreaking, status)
Foreign keys:
- categoryId → Category.id: ON DELETE RESTRICT, ON UPDATE CASCADE
- authorId → User.id: ON DELETE RESTRICT, ON UPDATE CASCADE
Transactions/raw SQL:
- No application raw SQL found.
- deleteCategory() uses a Prisma transaction: fetch/count, reject if used, otherwise delete.
- Other multi-step operations, including create/update slug checks and file/database actions, are not transactional.
6. Business Logic
- Public visibility requires published status, a non-null publication time at or before current time, an active author, and an active category.
- A category must be active to create an article in it or move an article into it.
- Inactive categories/users hide existing articles from public article lists, article detail, RSS, sitemap, homepage data, and related/latest lists.
- Article slug generation includes custom Devanagari transliteration before standard lowercase/hyphen normalization.
- Article creation resolves duplicate slugs with numeric suffixes; category creation does the same.
- Category deletion is forbidden while any article references it.
- Public article route and public page both increment views.
- Publication status transition determines publishedAt as described in the API inventory.
- Public list queries support pagination, text search, category, featured/breaking flags, and sorting.
- Server-rendered public pages call Prisma services directly rather than making HTTP calls to their own API.
- Article HTML is stored as submitted. It is sanitized only when rendered publicly; permitted tags are limited and links are restricted to http, https, mailto, and tel.
7. External Services & Dependencies
Dependency	Use
PostgreSQL	Primary database.
Prisma / @prisma/adapter-pg / pg	ORM, migration schema, and PostgreSQL connectivity.
Auth.js / NextAuth	Credentials authentication, JWT session, cookies, CSRF, admin proxy.
bcryptjs	Password verification and seed password hashing.
Sharp	Validates, rotates, resizes, and converts uploads to WebP.
Node filesystem	Stores and serves images under public/uploads/articles.
sanitize-html	Sanitizes stored article HTML at render time.
Zod	Server-side request and credentials validation.
YouTube no-cookie embed	Public frontend embeds validated YouTube URLs; no server API integration.


No email provider, cloud object storage, payment provider, AI API, analytics API, webhook provider, or external backend API was found.
8. Environment Variables
Actual values were not inspected or reproduced.
Variable	Required	Consumed by	Purpose
DATABASE_URL	Yes	Prisma config, Prisma client, seed script	PostgreSQL connection string.
AUTH_SECRET	Required in practice	Auth.js conventionally	Signs/encrypts Auth.js session material. Not explicitly referenced in source.
ADMIN_EMAIL	Required for seed	prisma/seed.ts	Seed admin email.
ADMIN_PASSWORD	Required for seed; minimum 12 chars	prisma/seed.ts	Seed admin password.
ADMIN_NAME	Optional	prisma/seed.ts	Seed admin name; default News Admin.
MAX_IMAGE_UPLOAD_MB	Optional	image-upload service	Positive numeric image-size limit; default 5 MiB.
NEXT_PUBLIC_SITE_URL	Optional	site config, sitemap, RSS, metadata	Canonical public site URL; invalid/missing values fall back to http://localhost:3000.
NODE_ENV	Runtime-provided	Prisma client	Enables global Prisma reuse outside production.


9. API Consumers
The admin client uses lib/api-client.ts, which expects every JSON API route to return the shared { success, data/error, meta } envelopes.
- Category table/form:
  - GET /api/categories
  - POST /api/categories
  - PATCH /api/categories/:id
  - DELETE /api/categories/:id
- Article table/form:
  - GET /api/articles?...
  - POST /api/articles
  - PATCH /api/articles/:id
  - DELETE /api/articles/:id
- Image upload component:
  - POST /api/uploads/images
- Admin login/logout:
  - uses Auth.js server functions rather than manually calling REST routes.
The public frontend does not primarily consume its own /api routes. It imports Prisma-backed service functions directly from server components for homepage, category, article, search, RSS, sitemap, and admin server-rendered pages.
The documented api.http file additionally uses:
- GET /api/auth/csrf
- POST /api/auth/callback/credentials
- GET /api/auth/session
- public article/category routes
- the authenticated admin=true article list
10. Migration Risks / Important Findings
- GET /api/articles?admin=true does not return 401 or 403 for a missing/non-admin session. It silently falls back to the public filtered list. This is likely surprising behavior and must be intentionally preserved or deliberately changed during migration.
- GET /api/categories and GET /api/categories/:id are public and can expose inactive categories and article counts. This differs from the stricter public-article visibility rule.
- Article deletion does not delete the article’s managed image. The admin UI’s “remove image” merely clears the featured-image field and also does not call the image-delete endpoint. Orphaned files can accumulate.
- Upload storage is local filesystem storage beneath the Next.js process working directory. This is tightly coupled to the deployment disk and unsuitable for horizontally scaled/ephemeral Laravel deployments without equivalent shared storage.
- Image writes and article creation/updates are not coordinated in one transaction; failed later operations can leave files behind.
- Slug uniqueness is checked in application code before writes, with database unique constraints as final protection. Concurrent creates can produce a conflict despite the suffix loop.
- Public article content is stored unsanitized and sanitized only on frontend render. A Laravel API serving raw content to another consumer would expose unsanitized HTML unless the same rendering/serialization boundary is preserved.
- View counts are incremented after public page rendering and separately in the public slug API. Crawlers, refreshes, duplicate requests, and API consumers all count as views; no visitor/session deduplication exists.
- The public article slug endpoint reads then increments, then returns article.views + 1; concurrent requests may receive a value that does not exactly represent the final persisted total.
- Auth session is JWT-based, while authorization re-checks the database for API calls. Laravel must reproduce the distinction if immediate deactivation/revocation behavior matters.
- PostgreSQL enum and timestamp(3) behavior must be mapped carefully to MySQL.
- Auth.js beta endpoint/cookie details are framework-managed. Needs verification if exact cookie names and all auxiliary auth route responses must remain compatible.
11. Next.js → Laravel Mapping Recommendations
Current concern	Laravel mapping
Prisma User, Category, Article	Eloquent models and migrations with string CUID primary keys, or a deliberate identifier migration with client impact assessed.
PostgreSQL enums	PHP backed enums / MySQL enum or constrained string columns for ADMIN, DRAFT, PUBLISHED, ARCHIVED.
Route handlers	REST controllers grouped under /api. Preserve route names and envelopes if frontend compatibility is required.
Zod schemas	Laravel Form Requests with the same required fields, nullable handling, grapheme-aware limits where necessary, and strict unknown-field behavior if desired.
authorizeAdmin()	Sanctum/token/session middleware plus a DB-backed active-user/role check.
Auth.js JWT cookies	Laravel Sanctum/session auth or JWT. A compatibility decision is required; browser clients cannot reuse Auth.js JWT cookies without implementing compatible verification.
Local uploads	Laravel filesystem disk. Use local disk only if persistence/shared-volume requirements are met; otherwise object storage. Preserve WebP conversion and path format if UI compatibility matters.
Sharp processing	Intervention Image / Imagick / libvips integration, matching JPEG/PNG/WebP validation, 40M pixel ceiling, auto-rotation, max width 1920, WebP quality 82.
Prisma query services	Eloquent query scopes for “currently public article,” active category, active author, search, pagination, and ordering.
after() view increment	Laravel dispatchAfterResponse() or an explicit synchronous atomic increment.
RSS/sitemap metadata routes	Laravel controller responses plus scheduled/cache strategy, with 15-minute regeneration/cache semantics.
HTML sanitization	HTMLPurifier or another server-side allowlist sanitizer matching the existing tag/attribute/scheme rules.


12. Migration Checklist
- Create MySQL migrations for users, categories, and articles, including all defaults, unique constraints, indexes, foreign keys, and restrict deletion behavior.
- Decide whether to preserve CUID string primary keys and existing records.
- Seed the initial admin with bcrypt cost 12 and matching normalized email behavior.
- Implement login, logout, session lifetime of 8 hours, and active-admin revalidation.
- Decide whether Laravel needs Auth.js cookie compatibility or whether frontend authentication will be migrated too.
- Recreate the shared success/error response envelopes and error codes.
- Implement all article routes, including public visibility, pagination metadata, view increments, and status-transition rules.
- Implement category routes, including current public access behavior and in-use deletion conflict.
- Recreate slug transliteration, fallback slugs, collision suffixing on create, and conflict-on-update behavior.
- Recreate article/category validation limits, nullable semantics, strict body handling, and timezone-aware publication timestamps.
- Implement managed image upload, conversion, secure filename checks, and referenced-image deletion protection.
- Decide and document an orphan-image cleanup policy if behavior is intentionally improved.
- Preserve render-time article HTML sanitization or move sanitization to an explicitly chosen safe boundary.
- Rebuild RSS, sitemap, robots, and public-query caching behavior.
- Add compatibility tests from api.http, including validation, duplicate slugs, invalid category, unauthenticated calls, and image failures.
- Verify Auth.js-managed routes/cookies against the running deployment before finalizing the authentication migration.


1:28 PM