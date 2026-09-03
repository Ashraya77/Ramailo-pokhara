const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "accessToken";

type RequestOptions = Omit<RequestInit, "body" | "method">;

function buildUrl(path: string): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return `${API_URL}/${path.replace(/^\//, "")}`;
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const accessToken = getAccessToken();
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  headers.set("Accept", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    method,
    headers,
    ...(body === undefined
      ? {}
      : { body: isFormData ? body : JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function get<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("GET", path, undefined, options);
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("POST", path, body, options);
}

export function put<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("PUT", path, body, options);
}

function deleteRequest<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("DELETE", path, body, options);
}

export { deleteRequest as delete };
