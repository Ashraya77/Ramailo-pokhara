import { errorResponse } from "@/app/lib/api-response";
import { ImageUploadError } from "@/app/lib/services/image-upload";

export function handleImageUploadError(error: unknown) {
  if (error instanceof ImageUploadError) {
    if (error.status >= 500) {
      console.error("Unexpected image upload API error:", error);
    }

    return errorResponse(error.code, error.message, error.status, error.details);
  }

  console.error("Unexpected image upload API error:", error);
  return errorResponse(
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred.",
    500,
  );
}
