/**
 * Cycle detection in dependency graph – PRD FR-AST-03.
 */

import type { DependencyNode } from "./types";

/**
 * Find all cycles in the graph using DFS (back edges).
 * Returns array of cycles, each cycle as array of path strings.
 */
export function findCycles(nodes: Map<string, DependencyNode>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const pathIndex = new Map<string, number>();
  const cycleSet = new Set<string>();

  function visit(key: string): void {
    if (visited.has(key)) return;
    visited.add(key);
    stack.add(key);
    const idx = path.length;
    path.push(key);
    pathIndex.set(key, idx);

    const node = nodes.get(key);
    if (node) {
      for (const dep of node.dependencies) {
        // Resolve dep to a key we have in nodes (match by path suffix)
        const depKey = resolveToNodeKey(dep, key, nodes);
        if (!depKey) continue;
        if (!visited.has(depKey)) {
          visit(depKey);
        } else if (stack.has(depKey)) {
          const start = pathIndex.get(depKey) ?? 0;
          const cycle = path.slice(start, path.length).concat(depKey);
          const cycleId = [...cycle].sort().join("|");
          if (!cycleSet.has(cycleId)) {
            cycleSet.add(cycleId);
            cycles.push(cycle);
          }
        }
      }
    }

    path.pop();
    pathIndex.delete(key);
    stack.delete(key);
  }

  for (const key of nodes.keys()) {
    visit(key);
  }

  return cycles;
}

const EXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

/**
 * Resolve a specifier to a node key in the graph (by path match).
 */
function resolveToNodeKey(
  spec: string,
  _fromPath: string,
  nodes: Map<string, DependencyNode>
): string | null {
  if (nodes.has(spec)) return spec;
  for (const key of nodes.keys()) {
    const keyBase = key.replace(EXT_RE, "");
    if (keyBase === spec || key === spec || key.endsWith("/" + spec)) return key;
  }
  return null;
}
