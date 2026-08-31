import {
  authorizationError,
  handleCategoryError,
  invalidSlugError,
  malformedJsonError,
  validationError,
} from "@/app/api/categories/category-route-utils";
import { authorizeAdmin } from "@/app/lib/admin-auth";
import { errorResponse, successResponse } from "@/app/lib/api-response";
import {
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/app/lib/services/category";
import { slugify, slugifyOrFallback } from "@/app/lib/slug";
import { updateCategorySchema } from "@/app/lib/validations/category";

type CategoryRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: CategoryRouteContext) {
  const { id } = await context.params;

  try {
    const category = await getCategoryById(id);

    return category
      ? successResponse(category)
      : errorResponse("CATEGORY_NOT_FOUND", "Category not found.", 404);
  } catch (error: unknown) {
    return handleCategoryError(error);
  }
}

export async function PATCH(request: Request, context: CategoryRouteContext) {
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

  const parsed = updateCategorySchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { id } = await context.params;
  const slugWasSupplied = Object.prototype.hasOwnProperty.call(parsed.data, "slug");

  try {
    const current = await getCategoryById(id);

    if (!current) {
      return errorResponse("CATEGORY_NOT_FOUND", "Category not found.", 404);
    }

    const slug = slugWasSupplied
      ? slugify(parsed.data.slug?.trim() || parsed.data.name || current.name) ||
        slugifyOrFallback(current.name, "category")
      : undefined;

    if (slugWasSupplied && !slug) {
      return invalidSlugError();
    }

    const category = await updateCategory(id, { ...parsed.data, slug });

    return category
      ? successResponse(category, {
          message: "Category updated successfully.",
        })
      : errorResponse("CATEGORY_NOT_FOUND", "Category not found.", 404);
  } catch (error: unknown) {
    return handleCategoryError(error);
  }
}

export async function DELETE(_request: Request, context: CategoryRouteContext) {
  const authorization = await authorizeAdmin();

  if (!authorization.authorized) {
    return authorizationError(authorization.reason);
  }

  const { id } = await context.params;

  try {
    const result = await deleteCategory(id);

    if (result.status === "not_found") {
      return errorResponse("CATEGORY_NOT_FOUND", "Category not found.", 404);
    }

    if (result.status === "in_use") {
      return errorResponse(
        "CATEGORY_IN_USE",
        "Category cannot be deleted because it is referenced by articles.",
        409,
        { articleCount: result.articleCount },
      );
    }

    return successResponse(result.category, {
      message: "Category deleted successfully.",
    });
  } catch (error: unknown) {
    return handleCategoryError(error);
  }
}
