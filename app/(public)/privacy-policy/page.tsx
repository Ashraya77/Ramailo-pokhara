import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "रमाइलो पोखरा डटकमको गोपनीयता नीति।",
  alternates: {
    canonical: new URL("/privacy-policy", siteConfig.url),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="public-container py-12 sm:py-16">
      <div className="mx-auto max-w-4xl border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">Privacy Policy</p>
        <h1 className="mt-3 font-editorial text-4xl font-black tracking-tight text-[var(--public-ink)] sm:text-5xl">
          गोपनीयता नीति
        </h1>
        <div className="mt-6 space-y-5 text-base leading-8 text-[var(--public-muted)]">
          <p>
            यस साइटमा प्रयोगकर्ताबाट प्राप्त सामान्य जानकारी, सम्पर्क विवरण वा
            पठाइएका सन्देशहरू जिम्मेवार रूपमा सुरक्षित राखिन्छन्।
          </p>
          <p>
            विश्लेषणात्मक प्रयोजनका लागि सीमित प्राविधिक डेटा प्रयोग हुन सक्छ, तर
            प्रयोगकर्ताको व्यक्तिगत जानकारी बिना अनुमति तेस्रो पक्षलाई उपलब्ध
            गराइँदैन।
          </p>
        </div>
      </div>
    </div>
  );
}
