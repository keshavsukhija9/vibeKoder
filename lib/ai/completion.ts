/**
 * Completion prompt and context logic – used by streaming and non-streaming routes.
 * Keeps API routes thin and logic testable.
 */

export function getLanguageFromFileName(fileName?: string): string {
  if (!fileName) return "TypeScript";
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    json: "JSON",
    css: "CSS",
    html: "HTML",
    md: "Markdown",
  };
  return map[ext ?? ""] ?? "TypeScript";
}

export interface CodeContext {
  language: string;
  beforeContext: string;
  currentLine: string;
  afterContext: string;
  cursorPosition: { line: number; column: number };
  fileName: string;
}

const CONTEXT_RADIUS = 15;

export function analyzeCodeContext(
  content: string,
  line: number,
  column: number,
  fileName?: string
): CodeContext {
  const lines = content.split("\n");
  const currentLine = lines[line] || "";
  const startLine = Math.max(0, line - CONTEXT_RADIUS);
  const endLine = Math.min(lines.length, line + CONTEXT_RADIUS);
  const beforeContext = lines.slice(startLine, line).join("\n");
  const afterContext = lines.slice(line + 1, endLine).join("\n");
  const language = getLanguageFromFileName(fileName);
  return {
    language,
    beforeContext,
    currentLine,
    afterContext,
    cursorPosition: { line, column },
    fileName: fileName ?? "file",
  };
}

export function buildPrompt(
  context: CodeContext,
  suggestionType: string,
  codebaseContext?: { filePath: string; content: string }[]
): string {
  const projectSection =
    codebaseContext?.length
      ? `\nRelevant code from this project (prefer these APIs and patterns):\n${codebaseContext.map((c) => `// ${c.filePath}\n${c.content}`).join("\n\n")}\n\n`
      : "";
  return `You are a precise code completion assistant. Output ONLY the exact code to insert at the cursor. No markdown, no backticks, no explanation.

Language: ${context.language}
File: ${context.fileName}
Request: ${suggestionType}
${projectSection}Context (|CURSOR| is insertion point):
${context.beforeContext}
${context.currentLine.substring(0, context.cursorPosition.column)}|CURSOR|${context.currentLine.substring(context.cursorPosition.column)}
${context.afterContext}

Rules: Match current indentation. Use types/imports from the project when shown above. Output only the completion text.`;
}
