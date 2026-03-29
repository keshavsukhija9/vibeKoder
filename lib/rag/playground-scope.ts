import { createHash } from "crypto";
import path from "path";

/** Stable filesystem / table suffix for a playground id (no path injection). */
export function playgroundScopeKey(playgroundId: string): string {
  return createHash("sha256").update(playgroundId, "utf8").digest("hex").slice(0, 24);
}

export function playgroundTableName(playgroundId: string): string {
  return `codebase_${playgroundScopeKey(playgroundId)}`;
}

export function playgroundHashesPath(playgroundId: string, cwd: string): string {
  return path.join(cwd, ".vibecoder", `rag-hashes-${playgroundScopeKey(playgroundId)}.json`);
}
