import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "सम्पर्क",
  description: "रमाइलो पोखरा डटकमको सम्पर्क विवरण।",
  alternates: {
    canonical: new URL("/contact", siteConfig.url),
  },
};

export default function ContactPage() {
  return (
    <div className="public-container py-12 sm:py-16">
      <div className="mx-auto max-w-4xl border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">सम्पर्क</p>
        <h1 className="mt-3 font-editorial text-4xl font-black tracking-tight text-[var(--public-ink)] sm:text-5xl">
          सम्पर्क
        </h1>
        <div className="mt-8 space-y-5 text-base leading-8 text-[var(--public-muted)]">
          <p>ईमेल: ramilopokhara66@gmail.com</p>
          <p>फोन: ९८४६०३०२०१</p>
        </div>
      </div>
    </div>
  );
}
