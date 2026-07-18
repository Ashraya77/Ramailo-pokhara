export class MultipartBodyTooLargeError extends Error {
  constructor() {
    super("The multipart request body is too large.");
    this.name = "MultipartBodyTooLargeError";
  }
}

export async function readMultipartFormData(
  request: Request,
  maximumBytes: number,
): Promise<FormData> {
  if (!request.body) {
    return new FormData();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maximumBytes) {
      await reader.cancel();
      throw new MultipartBodyTooLargeError();
    }

    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const contentType = request.headers.get("content-type");
  const bufferedRequest = new Response(body, {
    headers: contentType ? { "Content-Type": contentType } : undefined,
  });

  return bufferedRequest.formData();
}
