import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "युनिकोड",
  description: "रमाइलो पोखरा डटकमको युनिकोड सम्बन्धी पृष्ठ।",
  alternates: {
    canonical: new URL("/unicode", siteConfig.url),
  },
};

export default function UnicodePage() {
  return (
    <div className="public-container py-12 sm:py-16">
      <div className="mx-auto max-w-4xl border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">युनिकोड</p>
        <h1 className="mt-3 font-editorial text-4xl font-black tracking-tight text-[var(--public-ink)] sm:text-5xl">
          युनिकोड
        </h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-[var(--public-muted)]">
          <p>यो पृष्ठ युनिकोडसम्बन्धी जानकारीका लागि राखिएको छ।</p>
        </div>
      </div>
    </div>
  );
}
