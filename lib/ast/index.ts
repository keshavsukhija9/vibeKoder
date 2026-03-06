/**
 * VibeCoder AST module – PRD §5.5 (Codebase Intelligence & AST Analysis)
 * FR-AST-01/02/03: dependency graph and circular dependency detection.
 */

import { findCycles } from "./cycles";
import { getDependencies } from "./parse";
import type {
  ASTAnalysisResult,
  DependencyGraph,
  DependencyNode,
  GraphWarning,
} from "./types";

const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

/**
 * Build dependency graph from file list and detect cycles.
 */
export async function analyzeCodebase(
  files: { path: string; content: string }[]
): Promise<ASTAnalysisResult> {
  const nodes = new Map<string, DependencyNode>();
  const errors: { path: string; message: string }[] = [];

  const sourceFiles = files.filter((f) => SOURCE_EXT.test(f.path));

  for (const file of sourceFiles) {
    try {
      const deps = getDependencies(file.content, file.path);
      nodes.set(file.path, {
        path: file.path,
        dependencies: deps,
        kind: "module",
      });
    } catch (err) {
      errors.push({
        path: file.path,
        message: err instanceof Error ? err.message : "Parse error",
      });
    }
  }

  // Resolve dependency strings to keys that exist in nodes (add resolved keys)
  for (const node of nodes.values()) {
    const resolved: string[] = [];
    for (const spec of node.dependencies) {
      const key = resolveToExistingKey(spec, node.path, nodes);
      if (key) resolved.push(key);
    }
    node.dependencies = resolved;
  }

  const cycles = findCycles(nodes);
  const warnings: GraphWarning[] = cycles.map((cycle) => ({
    type: "circular",
    message: `Circular dependency: ${cycle.join(" → ")}`,
    paths: cycle,
  }));

  const graph: DependencyGraph = {
    nodes,
    cycles,
    warnings,
  };

  return { graph, errors };
}

function resolveToExistingKey(
  spec: string,
  fromPath: string,
  nodes: Map<string, DependencyNode>
): string | null {
  if (nodes.has(spec)) return spec;
  const fromDir = fromPath.includes("/") ? fromPath.replace(/\/[^/]+$/, "") : "";
  const base = spec.startsWith(".") ? (fromDir ? `${fromDir}/${spec}`.replace(/\/\.\//g, "/") : spec) : spec;
  const normalized = base.replace(/^\.\//, "").replace(/\/\.\.\//g, "/");
  if (nodes.has(normalized)) return normalized;
  for (const key of nodes.keys()) {
    if (key === normalized || key.startsWith(normalized + "/") || key.replace(SOURCE_EXT, "") === normalized) {
      return key;
    }
  }
  return null;
}

/**
 * Get structural risks (cycles + warnings) for UI.
 */
export async function getStructuralRisks(
  files: { path: string; content: string }[]
): Promise<{
  cycles: string[][];
  warnings: { type: string; message: string; paths?: string[] }[];
}> {
  const { graph } = await analyzeCodebase(files);
  const warnings = [
    {
      type: "regex-limitation",
      message:
        "Dependency extraction uses regex; dynamic imports and path aliases are not resolved.",
    },
    ...graph.warnings.map((w) => ({
      type: w.type,
      message: w.message,
      paths: w.paths,
    })),
  ];
  return {
    cycles: graph.cycles,
    warnings,
  };
}

export type { ASTAnalysisResult, DependencyGraph, DependencyNode, GraphWarning } from "./types";
export { getDependencies, resolveSpecifier } from "./parse";
export { findCycles } from "./cycles";
