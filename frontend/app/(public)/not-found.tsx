import Link from "next/link";

export default function NotFound() {
  return (
    <div className="public-container py-20 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5 border-y-2 border-[var(--public-border-strong)] py-10">
      <p className="editorial-kicker">त्रुटि ४०४</p>
      <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">पृष्ठ फेला परेन</h1>
      <p className="text-[var(--public-muted)]">
        तपाईंले खोज्नुभएको पृष्ठ फेला परेन। ठेगाना जाँच्नुहोस् वा समाचार ब्राउज गर्नुहोस्।
      </p>
      <div className="flex flex-wrap gap-5 text-sm font-medium">
        <Link className="text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)]" href="/">गृहपृष्ठ</Link>
        <Link className="text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)]" href="/news">ताजा समाचार</Link>
      </div>
      </div>
    </div>
  );
}
