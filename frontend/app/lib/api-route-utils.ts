import { errorResponse } from "@/app/lib/api-response";
import type { ZodError } from "zod";

export function validationError(error: ZodError) {
  return errorResponse(
    "VALIDATION_ERROR",
    "The request contains invalid data.",
    400,
    { issues: error.issues },
  );
}

export function malformedJsonError() {
  return errorResponse("MALFORMED_JSON", "Request body must be valid JSON.", 400);
}

export function invalidSlugError() {
  return errorResponse(
    "INVALID_SLUG",
    "A valid non-empty slug could not be generated.",
    400,
  );
}

export function authorizationError(
  reason: "UNAUTHENTICATED" | "FORBIDDEN" | "ERROR",
) {
  if (reason === "UNAUTHENTICATED") {
    return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
  }

  if (reason === "FORBIDDEN") {
    return errorResponse("FORBIDDEN", "Administrator access is required.", 403);
  }

  return errorResponse(
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred.",
    500,
  );
}
