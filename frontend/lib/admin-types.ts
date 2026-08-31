/**
 * Shared admin types used across client and server components.
 * These mirror the API/service return shapes without importing Prisma directly.
 */

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

export type ArticleAuthor = {
  id: string;
  name: string;
};

export type ArticleListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  youtubeUrl: string | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt: string | null;
  views: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category: ArticleCategory;
  author: ArticleAuthor;
};

export type ArticleDetail = ArticleListItem & {
  content: string;
};

export type ArticleListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    articles: number;
  };
};

export type UploadedImage = {
  url: string;
  filename: string;
  mimeType: "image/webp";
  size: number;
  width: number;
  height: number;
};
