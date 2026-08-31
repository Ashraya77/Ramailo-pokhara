import { siteConfig } from "@/app/lib/site-config";

const publicDateFormatter = (locale: string) => new Intl.DateTimeFormat(locale === "ne" ? "ne-NP-u-nu-deva" : "en-US", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Kathmandu",
});

const shortPublicDateFormatter = (locale: string) => new Intl.DateTimeFormat(locale === "ne" ? "ne-NP-u-nu-deva" : "en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kathmandu",
});

export function formatPublicDate(value: Date, locale = "ne"): string {
  return publicDateFormatter(locale).format(value);
}

export function formatPublicDateShort(value: Date, locale = "ne"): string {
  return shortPublicDateFormatter(locale).format(value);
}

export function hasMeaningfulUpdate(
  publishedAt: Date,
  updatedAt: Date,
): boolean {
  return updatedAt.getTime() - publishedAt.getTime() > 60_000;
}
