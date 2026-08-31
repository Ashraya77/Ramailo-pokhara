import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "हाम्रो बारे",
  description:
    "रमाइलो पोखरा डटकमको सम्पादकीय दृष्टि, समुदाय केन्द्रित पत्रकारिता र सम्पर्क विवरण।",
  alternates: {
    canonical: new URL("/about-us", siteConfig.url),
  },
};

export default function AboutUsPage() {
  return (
    <div className="public-container py-12 sm:py-16">
      <div className="mx-auto max-w-4xl border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">हाम्रो बारे</p>
        <h1 className="mt-3 font-editorial text-4xl font-black tracking-tight text-[var(--public-ink)] sm:text-5xl">
          समुदायसँग जोडिएको डिजिटल समाचार कक्ष
        </h1>
        <div className="mt-6 space-y-5 text-base leading-8 text-[var(--public-muted)]">
          <p>
            रमाइलो पोखरा डटकम पोखरा र आसपासका समुदाय, सार्वजनिक सरोकार, स्थानीय
            राजनीति, खेलकुद, संस्कृति र जनचासोका विषयमा विश्वसनीय सामग्री प्रस्तुत
            गर्ने डिजिटल समाचार मञ्च हो।
          </p>
          <p>
            हाम्रो प्राथमिकता छिटो भन्दा पनि सही, सन्तुलित र पढ्न सजिलो समाचार
            प्रकाशन गर्नु हो। स्थानीय आवाजलाई केन्द्रमा राखेर समुदायसँग प्रत्यक्ष
            जोडिने पत्रकारितामा हामी प्रतिबद्ध छौं।
          </p>
        </div>
      </div>
    </div>
  );
}
