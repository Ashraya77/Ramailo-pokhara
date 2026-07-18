import { Prisma } from "@/app/generated/prisma/client";
import { errorResponse } from "@/app/lib/api-response";
import {
  ArticleConflictError,
  InvalidArticleCategoryError,
} from "@/app/lib/services/article";

export function handleArticleError(error: unknown) {
  if (error instanceof ArticleConflictError) {
    return errorResponse("ARTICLE_SLUG_CONFLICT", error.message, 409, {
      field: "slug",
    });
  }

  if (error instanceof InvalidArticleCategoryError) {
    return errorResponse("INVALID_CATEGORY", error.message, 400, {
      field: "categoryId",
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse(
        "ARTICLE_SLUG_CONFLICT",
        "An article with this slug already exists.",
        409,
        { field: "slug" },
      );
    }

    if (error.code === "P2025") {
      return errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
    }

    if (error.code === "P2003") {
      return errorResponse(
        "INVALID_RELATION",
        "The selected category or author is no longer available.",
        400,
      );
    }
  }

  console.error("Unexpected article API error:", error);
  return errorResponse(
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred.",
    500,
  );
}
