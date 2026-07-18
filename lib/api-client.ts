/**
 * Typed API client for admin dashboard.
 * Wraps fetch with consistent error handling and response parsing.
 */

export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | readonly unknown[];
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown> | readonly unknown[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<ApiSuccessResponse<T>> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      "PARSE_ERROR",
      "The server returned an unexpected response.",
      response.status,
    );
  }

  const parsed = body as ApiResponse<T>;

  if (!parsed.success) {
    throw new ApiError(
      parsed.error.code,
      parsed.error.message,
      response.status,
      parsed.error.details,
    );
  }

  return parsed;
}

export async function apiGet<T>(url: string): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url);
  return parseResponse<T>(response);
}

export async function apiPost<T>(url: string, data: unknown): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(response);
}

export async function apiPatch<T>(url: string, data: unknown): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(response);
}

export async function apiDelete<T>(url: string, data?: unknown): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url, {
    method: "DELETE",
    ...(data
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : {}),
  });
  return parseResponse<T>(response);
}

export async function apiUpload<T>(url: string, formData: FormData): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  return parseResponse<T>(response);
}
