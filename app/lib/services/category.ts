import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/app/lib/prisma";
import { publicArticleSummarySelect } from "@/app/lib/services/article";
import type {
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/app/lib/validations/category";

const withArticleCount = {
  articles: true,
} satisfies Prisma.CategoryCountOutputTypeSelect;

export class CategoryConflictError extends Error {
  constructor(public readonly field: "name" | "slug") {
    super(`A category with this ${field} already exists.`);
    this.name = "CategoryConflictError";
  }
}

async function createUniqueCategorySlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const conflict = await prisma.category.findFirst({
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

export async function listCategories(query: CategoryListQuery) {
  return prisma.category.findMany({
    where: {
      ...(query.active === undefined ? {} : { isActive: query.active }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              {
                description: {
                  contains: query.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: withArticleCount } },
  });
}

export async function listActivePublicCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      color: true,
      updatedAt: true,
    },
  });
}

export async function listActivePublicCategoriesWithArticles(limitPerCategory = 6) {
  const now = new Date();

  return prisma.category.findMany({
    where: {
      isActive: true,
      articles: {
        some: {
          publishedAt: { not: null, lte: now },
          status: "PUBLISHED",
          author: { isActive: true },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      color: true,
      updatedAt: true,
      articles: {
        where: {
          status: "PUBLISHED",
          publishedAt: { not: null, lte: now },
          author: { isActive: true },
        },
        orderBy: { publishedAt: "desc" },
        take: limitPerCategory,
        select: publicArticleSummarySelect,
      },
    },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: { _count: { select: withArticleCount } },
  });
}

export async function findActiveCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: {
      slug,
      isActive: true,
    },
    include: { _count: { select: withArticleCount } },
  });
}

async function ensureUniqueCategory(
  name: string,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const conflict = await prisma.category.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [{ name }, { slug }],
    },
    select: { name: true, slug: true },
  });

  if (conflict?.name === name) {
    throw new CategoryConflictError("name");
  }

  if (conflict?.slug === slug) {
    throw new CategoryConflictError("slug");
  }
}

export async function createCategory(
  input: CreateCategoryInput & { slug: string },
) {
  const slug = await createUniqueCategorySlug(input.slug);
  await ensureUniqueCategory(input.name, slug);

  return prisma.category.create({
    data: { ...input, slug },
    include: { _count: { select: withArticleCount } },
  });
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput & { slug?: string },
) {
  const current = await prisma.category.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  await ensureUniqueCategory(
    input.name ?? current.name,
    input.slug ?? current.slug,
    id,
  );

  return prisma.category.update({
    where: { id },
    data: input,
    include: { _count: { select: withArticleCount } },
  });
}

export type DeleteCategoryResult =
  | { status: "not_found" }
  | { status: "in_use"; articleCount: number }
  | {
      status: "deleted";
      category: Awaited<ReturnType<typeof getCategoryById>>;
    };

export async function deleteCategory(id: string): Promise<DeleteCategoryResult> {
  return prisma.$transaction(async (transaction) => {
    const category = await transaction.category.findUnique({
      where: { id },
      include: { _count: { select: withArticleCount } },
    });

    if (!category) {
      return { status: "not_found" };
    }

    if (category._count.articles > 0) {
      return {
        status: "in_use",
        articleCount: category._count.articles,
      };
    }

    await transaction.category.delete({ where: { id } });

    return { status: "deleted", category };
  });
}
