/**
 * Single source of truth for Ollama API base URL.
 * Set OLLAMA_BASE_URL in env to override (e.g. for remote Ollama).
 */

export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

export function getOllamaUrl(path: string): string {
  const base = OLLAMA_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const OLLAMA_EMBED_PATH = "api/embed";
export const OLLAMA_GENERATE_PATH = "api/generate";
