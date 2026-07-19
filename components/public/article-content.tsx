import { sanitizeArticleHtml } from "@/app/lib/sanitize-article-html";

type ArticleContentProps = {
  html: string;
};

export function ArticleContent({ html }: ArticleContentProps) {
  const sanitizedHtml = sanitizeArticleHtml(html);

  return (
    <div
      className="article-prose prose prose-neutral mx-auto max-w-3xl prose-headings:font-editorial prose-headings:scroll-mt-24 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-[var(--public-ink)] prose-a:font-semibold prose-a:text-[var(--public-accent)] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-[var(--public-accent)] prose-blockquote:text-[var(--public-muted)] prose-figcaption:text-center prose-code:break-words prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-[2px] prose-pre:bg-[var(--public-ink)] prose-pre:text-[var(--public-paper)] [&_a]:[overflow-wrap:anywhere] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-[var(--public-accent)]"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
