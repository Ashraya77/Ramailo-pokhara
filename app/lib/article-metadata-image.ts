import { isSafeLocalArticleImagePath } from "@/app/lib/article-image-path";
import { siteConfig } from "@/app/lib/site-config";

export function normalizeArticleMetadataImage(
  value: string | null | undefined,
): URL | null {
  const image = value?.trim();

  if (!image) {
    return null;
  }

  if (isSafeLocalArticleImagePath(image)) {
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
