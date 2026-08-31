import type { Metadata } from "next";

import { siteConfig } from "@/app/lib/site-config";

const teamMembers = [
  { role: "संयोजक", name: "संजय अधिकारी" },
  { role: "निर्देशक प्रकाशन", name: "रामकृष्ण अधिकारी" },
  { role: "संवाददाता", name: "कुशल अधिकारी" },
  { role: "संवाददाता", name: "कुसुम अधिकारी" },
] as const;

export const metadata: Metadata = {
  title: "Our Team",
  description: "रमाइलो पोखरा डटकमको सम्पादकीय टोली।",
  alternates: {
    canonical: new URL("/our-team", siteConfig.url),
  },
};

export default function OurTeamPage() {
  return (
    <div className="public-container py-12 sm:py-16">
      <div className="mx-auto max-w-4xl border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">Our Team</p>
        <h1 className="mt-3 font-editorial text-4xl font-black tracking-tight text-[var(--public-ink)] sm:text-5xl">
          हाम्रो टोली
        </h1>
        <dl className="mt-8 space-y-5 text-base text-[var(--public-muted)]">
          {teamMembers.map((member, index) => (
            <div key={`${member.role}-${member.name}-${index}`}>
              <dt className="text-sm font-semibold tracking-[0.08em] text-[var(--public-ink)] uppercase">
                {member.role}
              </dt>
              <dd className="mt-1 text-lg leading-7">{member.name}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
