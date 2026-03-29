/**
 * POST /api/ast/analyze – Build dependency graph and detect cycles. PRD FR-AST-01/02/03.
 */

import { NextRequest, NextResponse } from "next/server";
import { getStructuralRisks } from "@/lib/ast";
import { readJsonBody } from "@/lib/api-errors";

export async function POST(request: NextRequest) {
  try {
    const parsed = await readJsonBody<{ files?: unknown }>(request);
    if (parsed.errorResponse) return parsed.errorResponse;
    const files = parsed.body.files as { path: string; content: string }[] | undefined;
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid 'files' array" },
        { status: 400 }
      );
    }
    const { cycles, warnings } = await getStructuralRisks(files);
    return NextResponse.json({
      cycles,
      warnings,
      hasCycles: cycles.length > 0,
    });
  } catch (err) {
    console.error("AST analyze error:", err);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
