import { randomUUID } from "node:crypto";
import {
  link,
  lstat,
  mkdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { prisma } from "@/app/lib/prisma";

const DEFAULT_MAX_UPLOAD_MB = 5;
const MAX_IMAGE_WIDTH = 1920;
const WEBP_QUALITY = 82;
const MAX_INPUT_PIXELS = 40_000_000;
const UPLOAD_PUBLIC_PREFIX = "/uploads/articles/";
const GENERATED_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

const acceptedImageTypes = {
  "image/jpeg": { format: "jpeg", extensions: new Set([".jpg", ".jpeg"]) },
  "image/png": { format: "png", extensions: new Set([".png"]) },
  "image/webp": { format: "webp", extensions: new Set([".webp"]) },
} as const;

type UploadErrorCode =
  | "FILE_REQUIRED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_IMAGE_TYPE"
  | "INVALID_IMAGE"
  | "INVALID_IMAGE_PATH"
  | "IMAGE_IN_USE"
  | "IMAGE_NOT_FOUND"
  | "UPLOAD_FAILED"
  | "DELETE_FAILED";

export class ImageUploadError extends Error {
  constructor(
    public readonly code: UploadErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export type UploadedImage = {
  url: string;
  filename: string;
  mimeType: "image/webp";
  size: number;
  width: number;
  height: number;
};

function isErrorWithCode(error: unknown): error is Error & { code: string } {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  );
}

function getUploadDirectory(): string {
  return path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "public",
    "uploads",
    "articles",
  );
}

export function getMaximumImageBytes(): number {
  const configured = Number.parseFloat(process.env.MAX_IMAGE_UPLOAD_MB ?? "");
  const megabytes =
    Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_MAX_UPLOAD_MB;

  return Math.floor(megabytes * 1024 * 1024);
}

export function getMaximumMultipartBytes(): number {
  return getMaximumImageBytes() + 1024 * 1024;
}

async function storeProcessedImage(buffer: Buffer): Promise<string> {
  const uploadDirectory = getUploadDirectory();
  await mkdir(/*turbopackIgnore: true*/ uploadDirectory, { recursive: true });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const filename = `${randomUUID()}.webp`;
    const temporaryFilename = `.upload-${randomUUID()}.tmp`;
    const finalPath = path.join(uploadDirectory, filename);
    const temporaryPath = path.join(uploadDirectory, temporaryFilename);
    let temporaryFileExists = false;

    try {
      await writeFile(/*turbopackIgnore: true*/ temporaryPath, buffer, {
        flag: "wx",
        mode: 0o644,
      });
      temporaryFileExists = true;
      await link(
        /*turbopackIgnore: true*/ temporaryPath,
        /*turbopackIgnore: true*/ finalPath,
      );
      await unlink(/*turbopackIgnore: true*/ temporaryPath);
      return filename;
    } catch (error: unknown) {
      if (temporaryFileExists) {
        try {
          await unlink(/*turbopackIgnore: true*/ temporaryPath);
        } catch (cleanupError: unknown) {
          if (!isErrorWithCode(cleanupError) || cleanupError.code !== "ENOENT") {
            console.error("Failed to remove a temporary image upload:", cleanupError);
          }
        }
      }

      if (isErrorWithCode(error) && error.code === "EEXIST") {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to generate a unique image filename.");
}

export async function uploadArticleImage(file: File): Promise<UploadedImage> {
  if (file.size === 0) {
    throw new ImageUploadError("FILE_REQUIRED", "A non-empty image is required.", 400);
  }

  const maximumBytes = getMaximumImageBytes();

  if (file.size > maximumBytes) {
    throw new ImageUploadError(
      "FILE_TOO_LARGE",
      "The image exceeds the configured upload size limit.",
      413,
      { maximumBytes },
    );
  }

  const acceptedType = acceptedImageTypes[
    file.type as keyof typeof acceptedImageTypes
  ];
  const extension = path.extname(file.name).toLowerCase();

  if (!acceptedType || !acceptedType.extensions.has(extension)) {
    throw new ImageUploadError(
      "UNSUPPORTED_IMAGE_TYPE",
      "Only JPEG, PNG, and WebP images are accepted.",
      415,
    );
  }

  let source: Buffer;

  try {
    source = Buffer.from(await file.arrayBuffer());
  } catch (error: unknown) {
    throw new ImageUploadError(
      "INVALID_IMAGE",
      "The uploaded image could not be read.",
      422,
      { cause: error instanceof Error ? error.name : "UnknownError" },
    );
  }

  let processed: Buffer;
  let width: number;
  let height: number;

  try {
    const image = sharp(source, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
      sequentialRead: true,
    });
    const metadata = await image.metadata();

    if (
      metadata.format !== acceptedType.format ||
      (metadata.pages !== undefined && metadata.pages > 1)
    ) {
      throw new Error("Image contents do not match the declared static format.");
    }

    const output = await image
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    processed = output.data;
    width = output.info.width;
    height = output.info.height;
  } catch (error: unknown) {
    throw new ImageUploadError(
      "INVALID_IMAGE",
      "The uploaded file is not a valid supported image.",
      422,
      { cause: error instanceof Error ? error.name : "UnknownError" },
    );
  }

  try {
    const filename = await storeProcessedImage(processed);

    return {
      url: `${UPLOAD_PUBLIC_PREFIX}${filename}`,
      filename,
      mimeType: "image/webp",
      size: processed.length,
      width,
      height,
    };
  } catch (error: unknown) {
    console.error("Failed to store an uploaded image:", error);
    throw new ImageUploadError(
      "UPLOAD_FAILED",
      "The image could not be stored.",
      500,
    );
  }
}

function resolveUploadedImage(url: string): {
  filename: string;
  filePath: string;
} {
  if (
    url.includes("\0") ||
    url.includes("\\") ||
    url.includes("..") ||
    !url.startsWith(UPLOAD_PUBLIC_PREFIX)
  ) {
    throw new ImageUploadError(
      "INVALID_IMAGE_PATH",
      "The image URL is not a valid managed upload path.",
      400,
    );
  }

  const filename = url.slice(UPLOAD_PUBLIC_PREFIX.length);

  if (!GENERATED_FILENAME_PATTERN.test(filename)) {
    throw new ImageUploadError(
      "INVALID_IMAGE_PATH",
      "The image URL is not a valid managed upload path.",
      400,
    );
  }

  const uploadDirectory = getUploadDirectory();
  const filePath = path.resolve(
    /*turbopackIgnore: true*/ uploadDirectory,
    filename,
  );

  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    throw new ImageUploadError(
      "INVALID_IMAGE_PATH",
      "The image URL is not a valid managed upload path.",
      400,
    );
  }

  return { filename, filePath };
}

export async function deleteArticleImage(url: string): Promise<{ url: string }> {
  const { filePath } = resolveUploadedImage(url);
  const referencedArticle = await prisma.article.findFirst({
    where: { featuredImage: url },
    select: { id: true },
  });

  if (referencedArticle) {
    throw new ImageUploadError(
      "IMAGE_IN_USE",
      "The image cannot be deleted because it is used by an article.",
      409,
    );
  }

  try {
    const file = await lstat(/*turbopackIgnore: true*/ filePath);

    if (!file.isFile() || file.isSymbolicLink()) {
      throw new ImageUploadError(
        "INVALID_IMAGE_PATH",
        "The managed image path does not reference a regular file.",
        400,
      );
    }

    await unlink(/*turbopackIgnore: true*/ filePath);
    return { url };
  } catch (error: unknown) {
    if (error instanceof ImageUploadError) {
      throw error;
    }

    if (isErrorWithCode(error) && error.code === "ENOENT") {
      throw new ImageUploadError(
        "IMAGE_NOT_FOUND",
        "The image does not exist.",
        404,
      );
    }

    console.error("Failed to delete an uploaded image:", error);
    throw new ImageUploadError(
      "DELETE_FAILED",
      "The image could not be deleted.",
      500,
    );
  }
}

export async function readArticleImage(filename: string): Promise<Buffer> {
  const { filePath } = resolveUploadedImage(
    `${UPLOAD_PUBLIC_PREFIX}${filename}`,
  );

  try {
    const file = await lstat(/*turbopackIgnore: true*/ filePath);

    if (!file.isFile() || file.isSymbolicLink()) {
      throw new ImageUploadError(
        "IMAGE_NOT_FOUND",
        "The image does not exist.",
        404,
      );
    }

    return await readFile(/*turbopackIgnore: true*/ filePath);
  } catch (error: unknown) {
    if (error instanceof ImageUploadError) {
      throw error;
    }

    if (isErrorWithCode(error) && error.code === "ENOENT") {
      throw new ImageUploadError(
        "IMAGE_NOT_FOUND",
        "The image does not exist.",
        404,
      );
    }

    throw error;
  }
}
