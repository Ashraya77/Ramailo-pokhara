import { handleArticleError } from "@/app/api/articles/article-route-utils";
import { errorResponse, successResponse } from "@/app/lib/api-response";
import { getPublishedArticleBySlug } from "@/app/lib/services/article";
import { slugify } from "@/app/lib/slug";

type ArticleSlugRouteContext = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: ArticleSlugRouteContext,
) {
  const { slug: rawSlug } = await context.params;
  const slug = slugify(rawSlug);

  if (!slug) {
    return errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
  }

  try {
    const article = await getPublishedArticleBySlug(slug);
    return article
      ? successResponse(article)
      : errorResponse("ARTICLE_NOT_FOUND", "Article not found.", 404);
  } catch (error: unknown) {
    return handleArticleError(error);
  }
}
