/**
 * Consistent API error responses and body size limit.
 * Use in API routes so clients get predictable { error, message } and status.
 */

import { NextResponse } from "next/server";

export const MAX_BODY_BYTES = 5 * 1024 * 1024; // 5MB

export function jsonError(
  status: number,
  error: string,
  message?: string
): NextResponse {
  return NextResponse.json(
    message ? { error, message } : { error },
    { status }
  );
}

/** Read request body as JSON; return parsed body or a 413/400 NextResponse. */
export async function readJsonBody<T = unknown>(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES
): Promise<{ body: T; errorResponse?: never } | { body?: never; errorResponse: NextResponse }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const n = parseInt(contentLength, 10);
    if (!Number.isNaN(n) && n > maxBytes) {
      return {
        errorResponse: jsonError(
          413,
          "Request body too large",
          `Maximum size is ${maxBytes / 1024 / 1024}MB`
        ),
      };
    }
  }
  try {
    const raw = await request.text();
    if (raw.length > maxBytes) {
      return {
        errorResponse: jsonError(
          413,
          "Request body too large",
          `Maximum size is ${maxBytes / 1024 / 1024}MB`
        ),
      };
    }
    const body = JSON.parse(raw) as T;
    return { body };
  } catch {
    return {
      errorResponse: jsonError(400, "Invalid JSON body"),
    };
  }
}
