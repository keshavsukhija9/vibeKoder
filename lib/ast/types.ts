/**
 * VibeCoder AST / Codebase Intelligence – PRD §5.5, §7.4
 *
 * Types for dependency graph and structural analysis.
 * Implementation is planned; these types define the contract.
 */

export interface DependencyNode {
  /** Module or file path. */
  path: string;
  /** Outgoing imports / requires. */
  dependencies: string[];
  /** Language or module type. */
  kind?: "module" | "script" | "style";
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  /** List of cycles (array of path arrays). */
  cycles: string[][];
  /** Warnings (e.g. missing modules, circular refs). */
  warnings: GraphWarning[];
}

export interface GraphWarning {
  type: "circular" | "missing" | "ambiguous";
  message: string;
  paths?: string[];
}

export interface ASTAnalysisResult {
  graph: DependencyGraph;
  /** Parsing or analysis errors per file. */
  errors: { path: string; message: string }[];
}
