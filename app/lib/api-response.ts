import { NextResponse } from "next/server";

type ErrorDetails = Record<string, unknown> | readonly unknown[];

export function successResponse<T>(
  data: T,
  options: {
    message?: string;
    status?: number;
    meta?: Record<string, unknown>;
  } = {},
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(options.message ? { message: options.message } : {}),
      data,
      ...(options.meta ? { meta: options.meta } : {}),
    },
    { status: options.status ?? 200 },
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: ErrorDetails,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );
}
