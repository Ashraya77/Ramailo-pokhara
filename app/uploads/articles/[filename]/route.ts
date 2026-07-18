import { errorResponse } from "@/app/lib/api-response";
import {
  ImageUploadError,
  readArticleImage,
} from "@/app/lib/services/image-upload";

type UploadedImageRouteContext = {
  params: Promise<{ filename: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: UploadedImageRouteContext,
) {
  const { filename } = await context.params;

  try {
    const image = await readArticleImage(filename);

    return new Response(new Uint8Array(image), {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Length": image.length.toString(),
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    if (error instanceof ImageUploadError && error.status < 500) {
      return errorResponse(error.code, error.message, error.status);
    }

    console.error("Unexpected uploaded image read error:", error);
    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "An unexpected server error occurred.",
      500,
    );
  }
}
