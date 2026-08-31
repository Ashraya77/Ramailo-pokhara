type YouTubeEmbedProps = {
  url?: string | null;
  articleTitle: string;
};

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

export function parseYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    let candidate: string | null = null;

    if (hostname === "youtu.be") {
      const segments = url.pathname.split("/").filter(Boolean);
      candidate = segments.length === 1 ? segments[0] : null;
    } else if (YOUTUBE_HOSTS.has(hostname)) {
      if (url.pathname === "/watch") {
        candidate = url.searchParams.get("v");
      } else {
        const segments = url.pathname.split("/").filter(Boolean);

        if (
          segments.length === 2 &&
          (segments[0] === "shorts" || segments[0] === "embed")
        ) {
          candidate = segments[1];
        }
      }
    }

    return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ url, articleTitle }: YouTubeEmbedProps) {
  const videoId = url ? parseYouTubeVideoId(url) : null;

  if (!videoId) {
    return null;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[2px] bg-muted">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={`Video for ${articleTitle}`}
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allowFullScreen
      />
    </div>
  );
}
