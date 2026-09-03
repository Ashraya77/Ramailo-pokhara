#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://localhost:8000}"
base_url="${base_url%/}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required." >&2
  exit 1
fi

request() {
  local path="$1"
  local response

  printf '\n=== GET %s ===\n' "$path"
  response="$(curl --silent --show-error --location "$base_url$path")"
  printf '%s\n' "$response"
  last_response="$response"
}

request '/api/categories'
categories_response="$last_response"
category_id="$(printf '%s' "$categories_response" | jq -r '.data[0].id // empty')"

if [[ -n "$category_id" ]]; then
  request "/api/categories/$category_id"
else
  request '/api/categories/__verify_api_map_missing__'
fi

request '/api/articles'
articles_response="$last_response"
article_slug="$(printf '%s' "$articles_response" | jq -r '.data[0].slug // empty')"

if [[ -n "$article_slug" ]]; then
  request "/api/articles/slug/$article_slug"
else
  request '/api/articles/slug/__verify_api_map_missing__'
fi



