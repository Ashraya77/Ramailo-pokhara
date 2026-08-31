import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="public-container py-20 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5 border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">श्रेणी उपलब्ध छैन</p>
        <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">
          यो समाचार श्रेणी उपलब्ध छैन।
        </h1>
        <p className="text-[var(--public-muted)]">
          यो श्रेणी अस्तित्वमा नहुन सक्छ वा सार्वजनिक ब्राउजिङका लागि उपलब्ध छैन।
        </p>
        <Link
          className="text-sm font-bold text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]"
          href="/news"
        >
          ताजा समाचार ब्राउज गर्नुहोस्
        </Link>
      </div>
    </div>
  );
}
