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
  name: "Ramailo Pokhara.com",
  description:
    "पोखरा तथा आसपासका ताजा समाचार, रिपोर्ट र सामुदायिक अपडेट।",
  locale: "ne",
  url: getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  navigation: Object.freeze([
    Object.freeze({ label: "गृहपृष्ठ", href: "/" }),
    Object.freeze({ label: "ताजा समाचार", href: "/news" }),
    Object.freeze({ label: "खोज्नुहोस्", href: "/search" }),
  ]),
  socialLinks: Object.freeze([]),
} as const);

export type SiteConfig = typeof siteConfig;
