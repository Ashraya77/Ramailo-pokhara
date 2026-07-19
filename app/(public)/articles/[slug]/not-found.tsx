import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="public-container py-20 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5 border-y-2 border-[var(--public-border-strong)] py-10">
      <p className="editorial-kicker">Article unavailable</p>
      <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">
        This article is not available.
      </h1>
      <p className="text-[var(--public-muted)]">
        The requested article cannot be viewed. You can continue browsing the latest news.
      </p>
      <nav aria-label="Article not found navigation" className="flex flex-wrap gap-5 text-sm font-medium">
        <Link className="text-[var(--public-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]" href="/">Home</Link>
        <Link className="text-[var(--public-accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-accent)]" href="/news">Latest News</Link>
      </nav>
      </div>
    </div>
  );
}
