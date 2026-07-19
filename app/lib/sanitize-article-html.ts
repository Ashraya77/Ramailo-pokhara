import "server-only";

import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "h2",
  "h3",
  "h4",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
  "code",
  "pre",
  "br",
] as const;

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...allowedTags],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => {
        const opensNewTab = attributes.target === "_blank";

        return {
          tagName: "a",
          attribs: {
            ...(attributes.href ? { href: attributes.href } : {}),
            ...(opensNewTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {}),
          },
        };
      },
    },
  });
}
