import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="public-container py-20 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5 border-y-2 border-[var(--public-border-strong)] py-10">
      <p className="editorial-kicker">समाचार उपलब्ध छैन</p>
      <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">
        यो समाचार उपलब्ध छैन।
      </h1>
      <p className="text-[var(--public-muted)]">
        माग गरिएको समाचार हेर्न मिल्दैन। तपाईं ताजा समाचार ब्राउज गर्न सक्नुहुन्छ।
      </p>
      <nav aria-label="समाचार फेला नपरेको नेभिगेसन" className="flex flex-wrap gap-5 text-sm font-medium">
        <Link className="text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]" href="/">गृहपृष्ठ</Link>
        <Link className="text-[var(--public-ink)] no-underline hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]" href="/news">ताजा समाचार</Link>
      </nav>
      </div>
    </div>
  );
}
