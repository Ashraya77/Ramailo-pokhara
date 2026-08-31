export const MIN_SEARCH_QUERY_LENGTH = 2;
export const MAX_SEARCH_QUERY_LENGTH = 200;

type SearchQueryStatus = "initial" | "too-short" | "too-long" | "valid";

export type NormalizedSearchQuery = {
  query: string;
  inputValue: string;
  status: SearchQueryStatus;
};

export function normalizeSearchQuery(
  value: string | string[] | undefined,
): NormalizedSearchQuery {
  const candidate = Array.isArray(value) ? value[0] : value;
  const query = candidate?.trim() ?? "";
  const inputValue = query.slice(0, MAX_SEARCH_QUERY_LENGTH);

  if (!query) return { query: "", inputValue: "", status: "initial" };
  if (query.length < MIN_SEARCH_QUERY_LENGTH) {
    return { query, inputValue, status: "too-short" };
  }
  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    return { query, inputValue, status: "too-long" };
  }

  return { query, inputValue, status: "valid" };
}
