import { handleArticleError } from "@/app/api/articles/article-route-utils";
import { authorizeAdmin } from "@/app/lib/admin-auth";
import { errorResponse, successResponse } from "@/app/lib/api-response";
import {
  authorizationError,
  invalidSlugError,
  malformedJsonError,
  validationError,
} from "@/app/lib/api-route-utils";
import {
  deleteArticle,
  getArticleById,
  updateArticle,
} from "@/app/lib/services/article";
import { slugify, slugifyOrFallback } from "@/app/lib/slug";
import { updateArticleSchema } from "@/app/lib/validations/article";

type ArticleRouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: ArticleRouteContext) {
  const authorization = await authorizeAdmin();

  if (!authorization.authorized) {
    return authorizationError(authorization.reason);
  }

  const { id } = await context.params;

  try {
    const article = await getArticleById(id);
    return article
      ? successResponse(article)
      : errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
  } catch (error: unknown) {
    return handleArticleError(error);
  }
}

export async function PATCH(request: Request, context: ArticleRouteContext) {
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

  const parsed = updateArticleSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { id } = await context.params;
  const slugWasSupplied = Object.prototype.hasOwnProperty.call(parsed.data, "slug");

  try {
    const current = await getArticleById(id);

    if (!current) {
      return errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
    }

    const slug = slugWasSupplied
      ? slugify(parsed.data.slug?.trim() || parsed.data.title || current.title) ||
        slugifyOrFallback(current.title, "news")
      : undefined;

    if (slugWasSupplied && !slug) {
      return invalidSlugError();
    }

    const article = await updateArticle(id, {
      ...parsed.data,
      ...(slug === undefined ? {} : { slug }),
    });

    return article
      ? successResponse(article, {
          message: "Article updated successfully.",
        })
      : errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
  } catch (error: unknown) {
    return handleArticleError(error);
  }
}

export async function DELETE(_request: Request, context: ArticleRouteContext) {
  const authorization = await authorizeAdmin();

  if (!authorization.authorized) {
    return authorizationError(authorization.reason);
  }

  const { id } = await context.params;

  try {
    const article = await deleteArticle(id);
    return article
      ? successResponse(article, {
          message: "Article deleted successfully.",
        })
      : errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
  } catch (error: unknown) {
    return handleArticleError(error);
  }
}
