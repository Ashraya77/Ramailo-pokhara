import { handleImageUploadError } from "@/app/api/uploads/images/image-route-utils";
import { authorizeAdmin } from "@/app/lib/admin-auth";
import { errorResponse, successResponse } from "@/app/lib/api-response";
import {
  authorizationError,
  malformedJsonError,
  validationError,
} from "@/app/lib/api-route-utils";
import {
  MultipartBodyTooLargeError,
  readMultipartFormData,
} from "@/app/lib/multipart";
import {
  deleteArticleImage,
  getMaximumMultipartBytes,
  uploadArticleImage,
} from "@/app/lib/services/image-upload";
import { deleteImageSchema } from "@/app/lib/validations/image-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = await authorizeAdmin();

  if (!authorization.authorized) {
    return authorizationError(authorization.reason);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
    return errorResponse(
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be multipart/form-data.",
      415,
    );
  }

  const contentLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(contentLength) &&
    contentLength > getMaximumMultipartBytes()
  ) {
    return errorResponse(
      "FILE_TOO_LARGE",
      "The upload exceeds the configured request size limit.",
      413,
    );
  }

  let formData: FormData;

  try {
    formData = await readMultipartFormData(
      request,
      getMaximumMultipartBytes(),
    );
  } catch (error: unknown) {
    if (error instanceof MultipartBodyTooLargeError) {
      return errorResponse(
        "FILE_TOO_LARGE",
        "The upload exceeds the configured request size limit.",
        413,
      );
    }

    return errorResponse(
      "INVALID_MULTIPART",
      "The multipart request body is malformed.",
      400,
    );
  }

  const value = formData.get("file");

  if (!(value instanceof File)) {
    return errorResponse("FILE_REQUIRED", "An image file is required.", 400);
  }

  try {
    const image = await uploadArticleImage(value);
    return successResponse(image, {
      message: "Image uploaded successfully.",
      status: 201,
    });
  } catch (error: unknown) {
    return handleImageUploadError(error);
  }
}

export async function DELETE(request: Request) {
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

  const parsed = deleteImageSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const deleted = await deleteArticleImage(parsed.data.url);
    return successResponse(deleted, {
      message: "Image deleted successfully.",
    });
  } catch (error: unknown) {
    return handleImageUploadError(error);
  }
}
