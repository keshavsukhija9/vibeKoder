/**
 * Extract import/require dependencies from JS/TS source (regex-based).
 * PRD FR-AST-01: codebase to AST representation for dependency graph.
 */

/**
 * Matches: import x from 'y' | import x from "y" | import 'y' | import "y"
 * import { a, b } from 'y' | import * as ns from 'y'
 */
const IMPORT_RE =
  /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;

/**
 * Matches: require('y') | require("y")
 */
const REQUIRE_RE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

// NOTE: dependency extraction uses regex, not a full AST parser.
// This covers standard ES import and CommonJS require patterns.
// Dynamic imports, re-exports, and path aliases are not resolved.
// Upgrade to @babel/parser if higher accuracy is needed.
function* extractSpecifiers(content: string): Generator<string> {
  let m: RegExpExecArray | null;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(content)) !== null) {
    if (m[1]) yield m[1].trim();
  }
  REQUIRE_RE.lastIndex = 0;
  while ((m = REQUIRE_RE.exec(content)) !== null) {
    if (m[1]) yield m[1].trim();
  }
}

/**
 * Resolve a specifier (e.g. ./utils, ../lib/foo) relative to filePath.
 * Returns a normalized key for the graph (relative path from project root or package name).
 */
export function resolveSpecifier(specifier: string, filePath: string): string {
  const trimmed = specifier.trim();
  if (!trimmed) return "";
  // Skip node_modules / bare specifiers – use as-is for graph key
  if (!trimmed.startsWith(".")) {
    return trimmed;
  }
  const dir = filePath.includes("/") ? filePath.replace(/\/[^/]+$/, "") : "";
  const parts = [...(dir ? dir.split("/") : []), ...trimmed.split("/")];
  const resolved: string[] = [];
  for (const p of parts) {
    if (p === "..") resolved.pop();
    else if (p !== ".") resolved.push(p);
  }
  const out = resolved.join("/");
  // Append .js/.ts if no extension so we can match to file paths
  if (out && !/\.(js|ts|jsx|tsx|json|mjs|cjs)$/i.test(out)) {
    return out; // caller can try .ts/.tsx when matching
  }
  return out;
}

/**
 * Extract dependency specifiers from file content.
 */
export function getDependencies(content: string, filePath: string): string[] {
  const deps = new Set<string>();
  for (const spec of extractSpecifiers(content)) {
    const resolved = resolveSpecifier(spec, filePath);
    if (resolved) deps.add(resolved);
  }
  return Array.from(deps);
}
