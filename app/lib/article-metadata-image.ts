import { siteConfig } from "@/app/lib/site-config";

function isSafeLocalArticleImage(value: string): boolean {
  const path = value.split(/[?#]/, 1)[0];

  if (!/^\/uploads\/articles\/[^/]+$/.test(path) || value.includes("\\")) {
    return false;
  }

  try {
    const decodedPath = decodeURIComponent(path);

    return (
      !decodedPath.includes("\\") &&
      !decodedPath
        .split("/")
        .some((segment) => segment === "." || segment === "..")
    );
  } catch {
    return false;
  }
}

export function normalizeArticleMetadataImage(
  value: string | null | undefined,
): URL | null {
  const image = value?.trim();

  if (!image) {
    return null;
  }

  if (isSafeLocalArticleImage(image)) {
    return new URL(image, siteConfig.url);
  }

  try {
    const url = new URL(image);

    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    ) {
      return url;
    }
  } catch {
    // Invalid image values are omitted from metadata.
  }

  return null;
}
