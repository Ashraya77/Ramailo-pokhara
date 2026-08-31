function decodePathname(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function hasUnsafePathSegments(value: string): boolean {
  return value
    .split("/")
    .some((segment) => segment === "." || segment === "..");
}

export function isSafeLocalArticleImagePath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return false;
  }

  const pathname = value.split(/[?#]/, 1)[0];

  if (!pathname || pathname.includes("\0")) {
    return false;
  }

  const decodedPathname = decodePathname(pathname);

  if (!decodedPathname || decodedPathname.includes("\\") || hasUnsafePathSegments(decodedPathname)) {
    return false;
  }

  return true;
}
