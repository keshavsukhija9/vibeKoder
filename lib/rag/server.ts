/**
 * LanceDB RAG – server-only (Node). Used by API routes.
 * Indexes are isolated per `playgroundId` (separate table + hash manifest).
 */

import path from "path";
import { createHash } from "crypto";
import fs from "fs";
import { chunkFiles } from "./chunk";
import { getEmbeddings } from "./embed";
import type { RAGSearchResult } from "./types";
import { playgroundHashesPath, playgroundTableName } from "./playground-scope";

const DEFAULT_TOP_K = 6;

function getDbPath(): string {
  const base = process.env.VIBECODER_LANCEDB_PATH || path.join(process.cwd(), ".vibecoder", "lancedb");
  return base;
}

export function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

type HashEntry = { hash: string; updatedAt: number };

function loadHashes(playgroundId: string): Record<string, HashEntry> {
  try {
    const p = playgroundHashesPath(playgroundId, process.cwd());
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw) as Record<string, HashEntry>;
  } catch {
    return {};
  }
}

function saveHashes(playgroundId: string, entries: Record<string, HashEntry>): void {
  const dir = path.join(process.cwd(), ".vibecoder");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = playgroundHashesPath(playgroundId, process.cwd());
  fs.writeFileSync(p, JSON.stringify(entries, null, 0), "utf-8");
}

export type LanceDbRow = {
  id: string;
  vector: number[];
  filePath: string;
  content: string;
  startLine: number;
  endLine: number;
  language?: string;
};

async function getDb() {
  const lancedb = await import("@lancedb/lancedb");
  const dbPath = getDbPath();
  return lancedb.connect(dbPath);
}

function tableName(playgroundId: string): string {
  return playgroundTableName(playgroundId);
}

export async function tableExists(playgroundId: string): Promise<boolean> {
  try {
    const db = await getDb();
    await db.openTable(tableName(playgroundId));
    return true;
  } catch {
    return false;
  }
}

export async function indexFiles(
  playgroundId: string,
  files: { path: string; content: string }[]
): Promise<{ chunksIndexed: number }> {
  const name = tableName(playgroundId);
  const hashes = loadHashes(playgroundId);
  const now = Date.now();
  const toEmbed: { path: string; content: string }[] = [];
  const unchangedPaths = new Set<string>();

  for (const f of files) {
    const h = hashContent(f.content);
    const existing = hashes[f.path];
    if (existing?.hash === h) {
      unchangedPaths.add(f.path);
    } else {
      toEmbed.push(f);
      hashes[f.path] = { hash: h, updatedAt: now };
    }
  }

  for (const p of unchangedPaths) {
    if (!hashes[p]) hashes[p] = { hash: "", updatedAt: now };
  }

  const db = await getDb();
  let keptRows: LanceDbRow[] = [];
  try {
    const table = await db.openTable(name);
    const all = await table
      .query()
      .select(["id", "filePath", "content", "vector", "startLine", "endLine", "language"])
      .toArray();
    const allRows = all as unknown as LanceDbRow[];
    keptRows = allRows.filter((r) => unchangedPaths.has(r.filePath));
  } catch {
    // table may not exist
  }

  let newRows: LanceDbRow[] = [];
  if (toEmbed.length > 0) {
    const chunks = chunkFiles(toEmbed.map((f) => ({ path: f.path, content: f.content })));
    if (chunks.length > 0) {
      const texts = chunks.map((c) => c.content);
      const vectors = await getEmbeddings(texts);
      newRows = chunks.map((c, i) => ({
        id: c.id,
        vector: vectors[i] ?? [],
        filePath: c.filePath,
        content: c.content,
        startLine: c.startLine,
        endLine: c.endLine,
        language: c.language,
      }));
    }
  }

  const rows = [...keptRows, ...newRows];
  if (rows.length === 0) {
    try {
      await db.dropTable(name);
    } catch {
      //
    }
    saveHashes(playgroundId, hashes);
    return { chunksIndexed: 0 };
  }

  try {
    await db.dropTable(name);
  } catch {
    //
  }
  await db.createTable(name, rows);
  saveHashes(playgroundId, hashes);
  return { chunksIndexed: rows.length };
}

export async function searchCodebase(
  playgroundId: string,
  query: string,
  topK = DEFAULT_TOP_K
): Promise<RAGSearchResult[]> {
  await import("@lancedb/lancedb");
  const db = await getDb();
  const name = tableName(playgroundId);
  let table;
  try {
    table = await db.openTable(name);
  } catch {
    return [];
  }

  const emb = await import("./embed").then((m) => m.getEmbedding(query));
  const vector = new Float32Array(emb);
  const results = await table.vectorSearch(vector).limit(topK).toArray();

  const withDistance = results as (LanceDbRow & { _distance?: number })[];
  return withDistance.map((row) => ({
    id: row.id,
    filePath: row.filePath,
    content: row.content,
    language: row.language,
    startLine: row.startLine,
    endLine: row.endLine,
    score: typeof row._distance === "number" ? Math.max(0, 1 - row._distance / 2) : 1,
  }));
}

export async function updateFileInIndex(
  playgroundId: string,
  filePath: string,
  content: string
): Promise<void> {
  const db = await getDb();
  const name = tableName(playgroundId);
  let table;
  try {
    table = await db.openTable(name);
  } catch {
    return;
  }
  const all = await table
    .query()
    .select(["id", "filePath", "content", "vector", "startLine", "endLine", "language"])
    .toArray();
  const rows = all as unknown as LanceDbRow[];
  const toKeep = rows.filter((r) => r.filePath !== filePath);
  const chunks = chunkFiles([{ path: filePath, content }]);
  if (chunks.length === 0 && toKeep.length === 0) {
    await db.dropTable(name).catch(() => {});
    return;
  }
  if (chunks.length > 0) {
    const texts = chunks.map((c) => c.content);
    const vectors = await getEmbeddings(texts);
    const newRows: LanceDbRow[] = chunks.map((c, i) => ({
      id: c.id,
      vector: vectors[i] ?? [],
      filePath: c.filePath,
      content: c.content,
      startLine: c.startLine,
      endLine: c.endLine,
      language: c.language,
    }));
    toKeep.push(...newRows);
  }
  await db.dropTable(name).catch(() => {});
  if (toKeep.length > 0) {
    await db.createTable(name, toKeep);
  }
}
