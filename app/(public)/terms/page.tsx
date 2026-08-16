import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Terms",
  description: "रमाइलो पोखरा डटकमका प्रयोग सर्तहरू।",
  alternates: {
    canonical: new URL("/terms", siteConfig.url),
  },
};

export default function TermsPage() {
  return (
    <div className="public-container py-12 sm:py-16">
      <div className="mx-auto max-w-4xl border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">Terms</p>
        <h1 className="mt-3 font-editorial text-4xl font-black tracking-tight text-[var(--public-ink)] sm:text-5xl">
          प्रयोग सर्तहरू
        </h1>
        <div className="mt-6 space-y-5 text-base leading-8 text-[var(--public-muted)]">
          <p>
            साइटमा प्रकाशित सामग्री व्यक्तिगत अध्ययन, सन्दर्भ र वैध समाचार उपभोगका
            लागि उपलब्ध छ। सामग्री पुनर्प्रकाशन गर्दा उचित स्रोत उल्लेख आवश्यक
            हुन्छ।
          </p>
          <p>
            गलत प्रयोग, भ्रामक प्रतिलिपि वा स्वामित्व अधिकार उल्लंघन भएको खण्डमा
            साइटले आवश्यक कारबाही अघि बढाउन सक्नेछ।
          </p>
        </div>
      </div>
    </div>
  );
}
