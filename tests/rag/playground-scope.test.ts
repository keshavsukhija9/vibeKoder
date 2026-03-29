import { describe, it, expect } from "vitest";
import { playgroundScopeKey, playgroundTableName } from "@/lib/rag/playground-scope";

describe("playground-scope", () => {
  it("produces stable scope key and table name", () => {
    const k = playgroundScopeKey("demo");
    expect(k).toHaveLength(24);
    expect(playgroundScopeKey("demo")).toBe(k);
    expect(playgroundTableName("demo")).toBe(`codebase_${k}`);
  });

  it("isolates different playground ids", () => {
    expect(playgroundScopeKey("a")).not.toBe(playgroundScopeKey("b"));
  });
});
