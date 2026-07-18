import {
  ArticleStatus,
  Prisma,
} from "@/app/generated/prisma/client";
import { prisma } from "@/app/lib/prisma";
import type {
  ArticleListQuery,
  CreateArticleInput,
  UpdateArticleInput,
} from "@/app/lib/validations/article";

const safeCategorySelect = {
  id: true,
  name: true,
  slug: true,
  color: true,
} satisfies Prisma.CategorySelect;

const safeAuthorSelect = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect;

const articleListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  featuredImageAlt: true,
  youtubeUrl: true,
  status: true,
  isFeatured: true,
  isBreaking: true,
  publishedAt: true,
  views: true,
  metaTitle: true,
  metaDescription: true,
  createdAt: true,
  updatedAt: true,
  category: { select: safeCategorySelect },
  author: { select: safeAuthorSelect },
} satisfies Prisma.ArticleSelect;

const articleDetailSelect = {
  ...articleListSelect,
  content: true,
} satisfies Prisma.ArticleSelect;

export class ArticleConflictError extends Error {
  constructor() {
    super("An article with this slug already exists.");
    this.name = "ArticleConflictError";
  }
}

export class InvalidArticleCategoryError extends Error {
  constructor() {
    super("The selected category does not exist or is inactive.");
    this.name = "InvalidArticleCategoryError";
  }
}

async function ensureActiveCategory(categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { isActive: true },
  });

  if (!category?.isActive) {
    throw new InvalidArticleCategoryError();
  }
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
  const conflict = await prisma.article.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (conflict) {
    throw new ArticleConflictError();
  }
}

function getOrderBy(
  sort: ArticleListQuery["sort"],
  order: ArticleListQuery["order"],
  isAdmin: boolean,
): Prisma.ArticleOrderByWithRelationInput {
  const direction = order ?? "desc";

  switch (sort ?? (isAdmin ? "updatedAt" : "publishedAt")) {
    case "createdAt":
      return { createdAt: direction };
    case "updatedAt":
      return { updatedAt: direction };
    case "title":
      return { title: direction };
    case "views":
      return { views: direction };
    default:
      return { publishedAt: direction };
  }
}

export async function listArticles(
  query: ArticleListQuery,
  isAdmin: boolean,
) {
  const now = new Date();
  const where: Prisma.ArticleWhereInput = {
    ...(!isAdmin
      ? {
          status: ArticleStatus.PUBLISHED,
          publishedAt: { not: null, lte: now },
        }
      : query.status
        ? { status: query.status }
        : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { excerpt: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.featured === undefined ? {} : { isFeatured: query.featured }),
    ...(query.breaking === undefined ? {} : { isBreaking: query.breaking }),
  };
  const skip = (query.page - 1) * query.limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      select: articleListSelect,
      orderBy: getOrderBy(query.sort, query.order, isAdmin),
      skip,
      take: query.limit,
    }),
    prisma.article.count({ where }),
  ]);
  const totalPages = Math.ceil(total / query.limit);

  return {
    articles,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    select: articleDetailSelect,
  });
}

export async function getPublishedArticleBySlug(slug: string) {
  try {
    return await prisma.article.update({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
        publishedAt: { not: null, lte: new Date() },
      },
      data: { views: { increment: 1 } },
      select: articleDetailSelect,
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
}

export async function createArticle(
  input: CreateArticleInput & { slug: string },
  authorId: string,
) {
  await Promise.all([
    ensureActiveCategory(input.categoryId),
    ensureUniqueSlug(input.slug),
  ]);

  const publishedAt =
    input.status === ArticleStatus.PUBLISHED
      ? input.publishedAt === undefined
        ? new Date()
        : input.publishedAt
      : input.status === ArticleStatus.DRAFT
        ? null
        : (input.publishedAt ?? null);

  return prisma.article.create({
    data: {
      ...input,
      slug: input.slug,
      authorId,
      publishedAt,
    },
    select: articleDetailSelect,
  });
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput & { slug?: string },
) {
  const current = await prisma.article.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  await Promise.all([
    input.categoryId && input.categoryId !== current.categoryId
      ? ensureActiveCategory(input.categoryId)
      : Promise.resolve(),
    input.slug ? ensureUniqueSlug(input.slug, id) : Promise.resolve(),
  ]);

  const data: Prisma.ArticleUncheckedUpdateInput = { ...input };
  const nextStatus = input.status ?? current.status;

  if (
    nextStatus === ArticleStatus.PUBLISHED &&
    current.status !== ArticleStatus.PUBLISHED &&
    input.publishedAt === undefined
  ) {
    data.publishedAt = new Date();
  } else if (
    current.status === ArticleStatus.PUBLISHED &&
    nextStatus === ArticleStatus.DRAFT
  ) {
    data.publishedAt = null;
  } else if (nextStatus === ArticleStatus.ARCHIVED) {
    data.publishedAt = current.publishedAt;
  }

  return prisma.article.update({
    where: { id },
    data,
    select: articleDetailSelect,
  });
}

export async function deleteArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    select: articleDetailSelect,
  });

  if (!article) {
    return null;
  }

  await prisma.article.delete({ where: { id } });
  return article;
}
