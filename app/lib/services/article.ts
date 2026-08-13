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

async function createUniqueArticleSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  // Keep generated slugs stable and URL-safe while resolving collisions.
  // Example: `news-20260813-abc123-2`
  // This only applies on create; updates still preserve explicit conflicts.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const conflict = await prisma.article.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!conflict) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
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
          author: { isActive: true },
          category: {
            isActive: true,
            ...(query.category ? { slug: query.category } : {}),
          },
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
    ...(isAdmin && query.category
      ? { category: { slug: query.category } }
      : {}),
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

const seoArticleSelect = {
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  featuredImageAlt: true,
  publishedAt: true,
  updatedAt: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  author: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ArticleSelect;

export async function listPublishedArticlesForSeo(limit?: number) {
  return prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null, lte: new Date() },
      author: { isActive: true },
      category: { isActive: true },
    },
    select: seoArticleSelect,
    orderBy: { publishedAt: "desc" },
    ...(limit === undefined ? {} : { take: limit }),
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    select: articleDetailSelect,
  });
}

export async function findPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null, lte: new Date() },
      author: { isActive: true },
      category: { isActive: true },
    },
    select: articleDetailSelect,
  });
}

export async function listRelatedPublishedArticlesByCategory({
  articleId,
  categoryId,
  limit = 6,
}: {
  articleId: string;
  categoryId: string;
  limit?: number;
}) {
  return prisma.article.findMany({
    where: {
      id: { not: articleId },
      categoryId,
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null, lte: new Date() },
      author: { isActive: true },
      category: { isActive: true },
    },
    select: articleListSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function listLatestPublishedArticles({
  excludeArticleId,
  limit = 6,
}: {
  excludeArticleId?: string;
  limit?: number;
}) {
  return prisma.article.findMany({
    where: {
      ...(excludeArticleId ? { id: { not: excludeArticleId } } : {}),
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null, lte: new Date() },
      author: { isActive: true },
      category: { isActive: true },
    },
    select: articleListSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export type PublishedArticleViewIncrementResult = {
  updated: boolean;
};

export async function incrementPublishedArticleViews(
  articleId: string,
): Promise<PublishedArticleViewIncrementResult> {
  const result = await prisma.article.updateMany({
    where: {
      id: articleId,
      status: ArticleStatus.PUBLISHED,
      publishedAt: { not: null, lte: new Date() },
      author: { isActive: true },
    },
    data: { views: { increment: 1 } },
    limit: 1,
  });

  return { updated: result.count === 1 };
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await findPublishedArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const result = await incrementPublishedArticleViews(article.id);

  return result.updated ? { ...article, views: article.views + 1 } : null;
}

export async function createArticle(
  input: CreateArticleInput & { slug: string },
  authorId: string,
) {
  await ensureActiveCategory(input.categoryId);

  const slug = await createUniqueArticleSlug(input.slug);

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
      slug,
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
