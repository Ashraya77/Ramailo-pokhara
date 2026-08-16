import Image from "next/image";

import { isSafeLocalArticleImagePath } from "@/app/lib/article-image-path";
import { cn } from "@/lib/utils";

type ArticleImageProps = {
  src?: string | null;
  alt?: string | null;
  title?: string | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

function normalizeLocalImage(value: string): string | null {
  return isSafeLocalArticleImagePath(value) ? value : null;
}

function normalizeExternalImage(value: string): string | null {
  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function ImagePlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="image-placeholder flex h-full items-center justify-center px-5 text-center text-[0.68rem] font-bold tracking-[0.12em] text-[var(--public-muted)] uppercase"
    >
      Ramailo Pokhara
    </div>
  );
}

export function ArticleImage({
  src,
  alt,
  title,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 960px",
  className,
}: ArticleImageProps) {
  const value = src?.trim();
  const accessibleAlt = alt?.trim() || title?.trim() || "";
  const localImage = value ? normalizeLocalImage(value) : null;
  const externalImage = value ? normalizeExternalImage(value) : null;

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-[2px] bg-muted",
        className,
      )}
    >
      {localImage ? (
        <Image
          src={localImage}
          alt={accessibleAlt}
          fill
          sizes={sizes}
          className="object-cover"
          preload={priority}
        />
      ) : externalImage ? (
        // No trusted remote host is configured, so valid external URLs bypass next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={externalImage}
          alt={accessibleAlt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
        />
      ) : (
        <ImagePlaceholder />
      )}
    </div>
  );
}
