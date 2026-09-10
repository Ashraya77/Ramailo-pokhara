function getSiteUrl(value: string | undefined): URL {
  if (!value) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url;
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL.");
  }

  throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL.");
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
