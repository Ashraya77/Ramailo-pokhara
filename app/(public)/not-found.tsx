import Link from "next/link";

export default function NotFound() {
  return (
    <div className="public-container py-20 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5 border-y-2 border-[var(--public-border-strong)] py-10">
      <p className="editorial-kicker">Error 404</p>
      <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">Page not found</h1>
      <p className="text-[var(--public-muted)]">
        The page you requested could not be found. Check the address or continue browsing.
      </p>
      <div className="flex flex-wrap gap-5 text-sm font-medium">
        <Link className="text-[var(--public-accent)] underline underline-offset-4" href="/">Home</Link>
        <Link className="text-[var(--public-accent)] underline underline-offset-4" href="/news">Latest News</Link>
      </div>
      </div>
    </div>
  );
}
