import type { NextRequest } from "next/server";

import { handleArticleError } from "@/app/api/articles/article-route-utils";
import { authorizeAdmin } from "@/app/lib/admin-auth";
import { successResponse } from "@/app/lib/api-response";
import {
  authorizationError,
  invalidSlugError,
  malformedJsonError,
  validationError,
} from "@/app/lib/api-route-utils";
import {
  createArticle,
  listArticles,
} from "@/app/lib/services/article";
import { slugify } from "@/app/lib/slug";
import {
  articleListQuerySchema,
  createArticleSchema,
} from "@/app/lib/validations/article";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = articleListQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  let isAdmin = false;

  if (parsed.data.admin) {
    const authorization = await authorizeAdmin();

    if (!authorization.authorized && authorization.reason === "ERROR") {
      return authorizationError(authorization.reason);
    }

    isAdmin = authorization.authorized;
  }

  try {
    const result = await listArticles(parsed.data, isAdmin);
    return successResponse(result.articles, { meta: result.meta });
  } catch (error: unknown) {
    return handleArticleError(error);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin();

  if (!authorization.authorized) {
    return authorizationError(authorization.reason);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return malformedJsonError();
  }

  const parsed = createArticleSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const slug = slugify(parsed.data.slug ?? parsed.data.title);

  if (!slug) {
    return invalidSlugError();
  }

  try {
    const article = await createArticle(
      { ...parsed.data, slug },
      authorization.userId,
    );
    return successResponse(article, {
      message: "Article created successfully.",
      status: 201,
    });
  } catch (error: unknown) {
    return handleArticleError(error);
  }
}
