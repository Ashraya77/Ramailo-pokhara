const DEVELOPMENT_SITE_URL = new URL("http://localhost:3000");

function getSiteUrl(value: string | undefined): URL {
  if (!value) {
    return DEVELOPMENT_SITE_URL;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url;
    }
  } catch {
    // Invalid public configuration safely falls back to the development URL.
  }

  return DEVELOPMENT_SITE_URL;
}

export const siteConfig = Object.freeze({
  name: "Ramailo Pokhara",
  description:
    "Independent news and updates from Pokhara and the surrounding community.",
  locale: "en",
  url: getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  navigation: Object.freeze([
    Object.freeze({ label: "Home", href: "/" }),
    Object.freeze({ label: "Latest News", href: "/news" }),
    Object.freeze({ label: "Search", href: "/search" }),
  ]),
  socialLinks: Object.freeze([]),
} as const);

export type SiteConfig = typeof siteConfig;
