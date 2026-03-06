/**
 * VibeCoder – Streaming code completion (PRD FR-AI-01)
 * Streams AI-generated completions in real time from Ollama.
 * Uses RAG when index exists for project-aware, accurate suggestions.
 */

import { type NextRequest, NextResponse } from "next/server";
import { searchCodebase } from "@/lib/rag/server";
import { getOllamaUrl, OLLAMA_GENERATE_PATH } from "@/lib/ollama";
import { analyzeCodeContext, buildPrompt } from "@/lib/ai/completion";
import { jsonError, readJsonBody } from "@/lib/api-errors";

interface StreamCompletionRequest {
  fileContent: string;
  cursorLine: number;
  cursorColumn: number;
  suggestionType: string;
  fileName?: string;
  codebaseContext?: { filePath: string; content: string; score?: number }[];
}

const OLLAMA_HINT =
  "Ensure Ollama is running (ollama serve) and install a model: ollama pull codellama";

export async function POST(request: NextRequest) {
  try {
    const parsed = await readJsonBody<StreamCompletionRequest>(request);
    if (parsed.errorResponse) return parsed.errorResponse;
    const body = parsed.body;

    const { fileContent, cursorLine, cursorColumn, suggestionType, fileName, codebaseContext } = body;

    if (!fileContent || cursorLine < 0 || cursorColumn < 0 || !suggestionType) {
      return jsonError(400, "Invalid input parameters");
    }

    const context = analyzeCodeContext(fileContent, cursorLine, cursorColumn, fileName);

    let ragContext = codebaseContext;
    if (!ragContext?.length) {
      try {
        const query = [context.beforeContext.slice(-500), context.currentLine, context.afterContext.slice(0, 300)].filter(Boolean).join("\n");
        const ragChunks = await searchCodebase(query, 5);
        if (ragChunks.length > 0) {
          ragContext = ragChunks.map((c) => ({ filePath: c.filePath, content: c.content, score: c.score }));
        }
      } catch {
        // RAG optional; continue without codebase context
      }
    }

    const prompt = buildPrompt(context, suggestionType, ragContext);

    const model = process.env.VIBECODER_LLM_MODEL ?? "codellama:latest";
    const ollamaUrl = getOllamaUrl(OLLAMA_GENERATE_PATH);

    const ac = new AbortController();
    const requestAborted = () => ac.abort();
    request.signal?.addEventListener("abort", requestAborted);

    const ollamaRes = await fetch(ollamaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
        options: { temperature: 0.35, num_predict: 300 },
      }),
      signal: ac.signal,
    });

    request.signal?.removeEventListener("abort", requestAborted);

    if (!ollamaRes.ok || !ollamaRes.body) {
      return NextResponse.json(
        { error: "Ollama error", message: `${ollamaRes.statusText}. ${OLLAMA_HINT}` },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            if (request.signal?.aborted) break;
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const obj = JSON.parse(line) as { response?: string; done?: boolean };
                if (obj.response) controller.enqueue(encoder.encode(obj.response));
                if (obj.done) break;
              } catch {
                // skip non-JSON lines
              }
            }
          }
        } finally {
          request.signal?.removeEventListener("abort", requestAborted);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return new Response(null, { status: 499 });
    }
    const e = error instanceof Error ? error : new Error(String(error));
    console.error("Stream completion error:", e);
    const isNetworkError =
      e instanceof TypeError &&
      (e.message.includes("fetch failed") ||
        e.message.includes("ECONNREFUSED") ||
        e.message.includes("ENOTFOUND"));
    if (isNetworkError) {
      return jsonError(
        502,
        "ollama_unreachable",
        "Ollama stopped responding mid-stream. Ensure Ollama is still running (ollama serve)."
      );
    }
    return jsonError(500, "stream_error", e.message);
  }
}
