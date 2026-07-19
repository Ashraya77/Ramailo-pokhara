import { siteConfig } from "@/app/lib/site-config";

const publicDateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Kathmandu",
});

const shortPublicDateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kathmandu",
});

export function formatPublicDate(value: Date): string {
  return publicDateFormatter.format(value);
}

export function formatPublicDateShort(value: Date): string {
  return shortPublicDateFormatter.format(value);
}

export function hasMeaningfulUpdate(
  publishedAt: Date,
  updatedAt: Date,
): boolean {
  return updatedAt.getTime() - publishedAt.getTime() > 60_000;
}
