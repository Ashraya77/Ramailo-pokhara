import { Prisma } from "@/app/generated/prisma/client";
import { errorResponse } from "@/app/lib/api-response";
import { CategoryConflictError } from "@/app/lib/services/category";
export {
  authorizationError,
  invalidSlugError,
  malformedJsonError,
  validationError,
} from "@/app/lib/api-route-utils";

export function handleCategoryError(error: unknown) {
  if (error instanceof CategoryConflictError) {
    return errorResponse(
      "CATEGORY_CONFLICT",
      error.message,
      409,
      { field: error.field },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse(
        "CATEGORY_CONFLICT",
        "A category with this name or slug already exists.",
        409,
      );
    }

    if (error.code === "P2025") {
      return errorResponse("CATEGORY_NOT_FOUND", "Category not found.", 404);
    }

    if (error.code === "P2003") {
      return errorResponse(
        "CATEGORY_IN_USE",
        "Category cannot be deleted because it is referenced by articles.",
        409,
      );
    }
  }

  console.error("Unexpected category API error:", error);
  return errorResponse(
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred.",
    500,
  );
}
