/**
 * POST /api/rag/search – Vector search over indexed codebase. PRD FR-RAG-03 (< 100ms).
 */

import { NextRequest, NextResponse } from "next/server";
import { searchCodebase } from "@/lib/rag/server";
import { jsonError, readJsonBody } from "@/lib/api-errors";

export async function POST(request: NextRequest) {
  try {
    const parsed = await readJsonBody<{ query?: string; topK?: number }>(request);
    if (parsed.errorResponse) return parsed.errorResponse;
    const body = parsed.body;
    const query = body.query;
    const topK = typeof body.topK === "number" ? body.topK : 6;
    if (!query || typeof query !== "string") {
      return jsonError(400, "Missing or invalid 'query' string");
    }
    const start = Date.now();
    const chunks = await searchCodebase(query.trim(), topK);
    const retrievalMs = Date.now() - start;
    return NextResponse.json({
      chunks: chunks.map((c) => ({
        filePath: c.filePath,
        content: c.content,
        score: c.score,
        startLine: c.startLine,
        endLine: c.endLine,
      })),
      metadata: { retrievalMs, count: chunks.length },
    });
  } catch (err) {
    console.error("RAG search error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(500, "Search failed", message);
  }
}
