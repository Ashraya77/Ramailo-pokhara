const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const ACCESS_TOKEN_KEY = "laravel_access_token";
type RequestOptions = Omit<RequestInit, "body" | "method">;
export class LaravelApiError extends Error { public constructor(public readonly status: number, message: string, public readonly fields: Record<string, string[]> = {}) { super(message); this.name = "LaravelApiError"; } }
export function setAccessToken(token: string): void { window.localStorage.setItem(ACCESS_TOKEN_KEY, token); }
export function clearAccessToken(): void { window.localStorage.removeItem(ACCESS_TOKEN_KEY); }
function buildUrl(path: string): string { if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured."); return `${API_URL}/${path.replace(/^\//, "")}`; }
export function getAccessToken(): string | null { return typeof window === "undefined" ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY); }
async function request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> { const headers = new Headers(options.headers); const token = getAccessToken(); const isFormData = typeof FormData !== "undefined" && body instanceof FormData; headers.set("Accept", "application/json"); if (token) headers.set("Authorization", `Bearer ${token}`); if (body !== undefined && !isFormData) headers.set("Content-Type", "application/json"); const response = await fetch(buildUrl(path), { ...options, method, headers, ...(body === undefined ? {} : { body: isFormData ? body : JSON.stringify(body) }) }); if (!response.ok) { const payload = await response.json().catch(() => null) as { message?: string; errors?: Record<string, string[]>; error?: { message?: string } } | null; throw new LaravelApiError(response.status, payload?.message ?? payload?.error?.message ?? "The request could not be completed.", payload?.errors ?? {}); } return response.json() as Promise<T>; }
export function get<T>(path: string, options?: RequestOptions): Promise<T> { return request<T>("GET", path, undefined, options); }
export function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> { return request<T>("POST", path, body, options); }
export function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> { return request<T>("PUT", path, body, options); }
function deleteRequest<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> { return request<T>("DELETE", path, body, options); }
export { deleteRequest as delete };
