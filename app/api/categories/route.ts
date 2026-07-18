import type { NextRequest } from "next/server";

import {
  authorizationError,
  handleCategoryError,
  invalidSlugError,
  malformedJsonError,
  validationError,
} from "@/app/api/categories/category-route-utils";
import { authorizeAdmin } from "@/app/lib/admin-auth";
import { successResponse } from "@/app/lib/api-response";
import {
  createCategory,
  listCategories,
} from "@/app/lib/services/category";
import { slugify } from "@/app/lib/slug";
import {
  categoryListQuerySchema,
  createCategorySchema,
} from "@/app/lib/validations/category";

export async function GET(request: NextRequest) {
  const rawQuery = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = categoryListQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    return successResponse(await listCategories(parsed.data));
  } catch (error: unknown) {
    return handleCategoryError(error);
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

  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const slug = slugify(parsed.data.slug ?? parsed.data.name);

  if (!slug) {
    return invalidSlugError();
  }

  try {
    const category = await createCategory({ ...parsed.data, slug });
    return successResponse(category, {
      message: "Category created successfully.",
      status: 201,
    });
  } catch (error: unknown) {
    return handleCategoryError(error);
  }
}
