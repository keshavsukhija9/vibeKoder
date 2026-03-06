/**
 * Embeddings via local Ollama – used only in server/API (Node).
 * Requires Ollama running and: ollama pull nomic-embed-text
 */

import { getOllamaUrl, OLLAMA_EMBED_PATH } from "@/lib/ollama";

const EMBED_MODEL = process.env.VIBECODER_EMBED_MODEL ?? "nomic-embed-text";
const BATCH_SIZE = 10;

const OLLAMA_EMBED_HINT = `Ensure Ollama is running (ollama serve) and install the embed model: ollama pull ${EMBED_MODEL}`;

function wrapOllamaError(e: unknown, context: string): Error {
  console.error("[ollama:embed] original error:", e);
  const msg = e instanceof Error ? e.message : String(e);
  if (/fetch|ECONNREFUSED|network|failed to fetch/i.test(msg)) {
    return new Error(`Ollama is not reachable. ${OLLAMA_EMBED_HINT}`);
  }
  return new Error(`${context} ${msg}. ${OLLAMA_EMBED_HINT}`);
}

export async function getEmbedding(text: string): Promise<number[]> {
  const url = getOllamaUrl(OLLAMA_EMBED_PATH);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input: text }),
    });
    if (!res.ok) {
      throw new Error(`Ollama embed failed: ${res.statusText}. ${OLLAMA_EMBED_HINT}`);
    }
    const data = (await res.json()) as { embeddings?: number[][] };
    const emb = data.embeddings;
    if (!emb?.[0]) throw new Error("No embedding in response");
    return emb[0];
  } catch (e) {
    throw wrapOllamaError(e, "Embed failed.");
  }
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const url = getOllamaUrl(OLLAMA_EMBED_PATH);
  const results: number[][] = [];
  try {
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: EMBED_MODEL, input: batch }),
      });
      if (!res.ok) {
        throw new Error(`Ollama embed failed: ${res.statusText}. ${OLLAMA_EMBED_HINT}`);
      }
      const data = (await res.json()) as { embeddings?: number[][] };
      const emb = data.embeddings ?? [];
      results.push(...emb);
    }
    return results;
  } catch (e) {
    throw wrapOllamaError(e, "Embed failed.");
  }
}
