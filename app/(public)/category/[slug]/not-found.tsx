import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="public-container py-20 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5 border-y-2 border-[var(--public-border-strong)] py-10">
        <p className="editorial-kicker">Category unavailable</p>
        <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">
          This news category is not available.
        </h1>
        <p className="text-[var(--public-muted)]">
          It may not exist or is not currently open to public browsing.
        </p>
        <Link
          className="text-sm font-bold text-[var(--public-accent)] underline underline-offset-4"
          href="/news"
        >
          Browse latest news
        </Link>
      </div>
    </div>
  );
}
