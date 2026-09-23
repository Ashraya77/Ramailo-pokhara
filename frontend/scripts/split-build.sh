#!/usr/bin/env bash

set -euo pipefail

readonly PROJECT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
readonly SOURCE_DIRECTORY="${PROJECT_DIRECTORY}/out"
readonly PUBLIC_DIRECTORY="${PROJECT_DIRECTORY}/out-public"
readonly ADMIN_DIRECTORY="${PROJECT_DIRECTORY}/out-admin"

# Admin-only route directories copied in full.
readonly ADMIN_ROUTE_DIRECTORIES=(dashboard login categories)

if [[ ! -d "${SOURCE_DIRECTORY}" ]]; then
    echo "Missing ${SOURCE_DIRECTORY}. Run npm run build first." >&2
    exit 1
fi

rm -rf -- "${PUBLIC_DIRECTORY}" "${ADMIN_DIRECTORY}"
mkdir -p -- "${PUBLIC_DIRECTORY}" "${ADMIN_DIRECTORY}"

# Public: begin with the complete export, then remove admin-only routes.
cp -a "${SOURCE_DIRECTORY}/." "${PUBLIC_DIRECTORY}/"

for route in "${ADMIN_ROUTE_DIRECTORIES[@]}"; do
    rm -rf -- "${PUBLIC_DIRECTORY}/${route}"
done

# /articles is shared: direct files are the admin index route; its child
# directories edit/ and new/ are admin routes. Public article slugs remain.
rm -rf -- "${PUBLIC_DIRECTORY}/articles/edit" "${PUBLIC_DIRECTORY}/articles/new"
find "${PUBLIC_DIRECTORY}/articles" -maxdepth 1 -type f -delete

# Admin: copy the shared Next.js assets and only admin route artifacts.
cp -a "${SOURCE_DIRECTORY}/_next" "${ADMIN_DIRECTORY}/_next"

for route in "${ADMIN_ROUTE_DIRECTORIES[@]}"; do
    cp -a "${SOURCE_DIRECTORY}/${route}" "${ADMIN_DIRECTORY}/${route}"
done

mkdir -p -- "${ADMIN_DIRECTORY}/articles"
find "${SOURCE_DIRECTORY}/articles" -maxdepth 1 -type f -exec cp -a -- {} "${ADMIN_DIRECTORY}/articles/" \;
cp -a "${SOURCE_DIRECTORY}/articles/edit" "${ADMIN_DIRECTORY}/articles/edit"
cp -a "${SOURCE_DIRECTORY}/articles/new" "${ADMIN_DIRECTORY}/articles/new"

printf '%s\n' "Created out-public/ and out-admin/ from out/."
printf '%s\n' "Admin includes: _next/, dashboard/, login/, categories/, articles/ (direct files, edit/, new/)."
printf '%s\n' "Public excludes: dashboard/, login/, categories/, articles direct files, articles/edit/, articles/new/."
