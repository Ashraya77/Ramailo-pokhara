import { ArticleStatus } from "@/app/generated/prisma/client";
import { isSafeLocalArticleImagePath } from "@/app/lib/article-image-path";
import { countGraphemes, hasVisibleText } from "@/app/lib/text";
import { z } from "zod";

function isAcceptedImageLocation(value: string): boolean {
  if (isSafeLocalArticleImagePath(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isYouTubeUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.slice(1).length > 0;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      return (
        (url.pathname === "/watch" && Boolean(url.searchParams.get("v"))) ||
        (url.pathname.startsWith("/embed/") && url.pathname.length > 7)
      );
    }

    return false;
  } catch {
    return false;
  }
}

const nullableTrimmedString = (maximum: number, field: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => countGraphemes(value) <= maximum,
      `${field} must contain at most ${maximum} characters.`,
    )
    .nullable();

const boundedString = (minimum: number, maximum: number, field: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => countGraphemes(value) >= minimum,
      `${field} must contain at least ${minimum} characters.`,
    )
    .refine(
      (value) => countGraphemes(value) <= maximum,
      `${field} must contain at most ${maximum} characters.`,
    );

const articleFields = {
  title: boundedString(5, 200, "Title"),
  slug: z
    .string()
    .trim()
    .refine(
      (value) => countGraphemes(value) <= 220,
      "Slug must contain at most 220 characters.",
    )
    .optional(),
  excerpt: nullableTrimmedString(500, "Excerpt").optional(),
  content: z
    .string()
    .refine((value) => hasVisibleText(value), "Content cannot be empty."),
  featuredImage: z
    .string()
    .trim()
    .refine(
      isAcceptedImageLocation,
      "Featured image must be an HTTP(S) URL or an /uploads/ path.",
    )
    .nullable()
    .optional(),
  featuredImageAlt: nullableTrimmedString(200, "Featured image alt").optional(),
  youtubeUrl: z
    .string()
    .trim()
    .refine(isYouTubeUrl, "YouTube URL is invalid.")
    .nullable()
    .optional(),
  status: z.enum(ArticleStatus).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  publishedAt: z
    .string()
    .datetime({ offset: true })
    .transform((value) => new Date(value))
    .nullable()
    .optional(),
  categoryId: z.string().trim().min(1, "Category is required."),
  metaTitle: nullableTrimmedString(70, "Meta title").optional(),
  metaDescription: nullableTrimmedString(170, "Meta description").optional(),
};

export const createArticleSchema = z
  .object({
    ...articleFields,
    status: articleFields.status.default(ArticleStatus.DRAFT),
    isFeatured: articleFields.isFeatured.default(false),
    isBreaking: articleFields.isBreaking.default(false),
  })
  .strict();

export const updateArticleSchema = z
  .object({
    ...articleFields,
    title: articleFields.title.optional(),
    content: articleFields.content.optional(),
    categoryId: articleFields.categoryId.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be supplied.",
  });

const queryBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const articleListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(200).optional(),
    category: z.string().trim().min(1).optional(),
    categoryId: z.string().trim().min(1).optional(),
    status: z.enum(ArticleStatus).optional(),
    featured: queryBoolean.optional(),
    breaking: queryBoolean.optional(),
    sort: z
      .enum(["publishedAt", "createdAt", "updatedAt", "title", "views"])
      .optional(),
    order: z.enum(["asc", "desc"]).optional(),
    admin: queryBoolean.optional(),
  })
  .strict()
  .refine((query) => !(query.category && query.categoryId), {
    message: "Use either category or categoryId, not both.",
    path: ["category"],
  });

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;
