/**
 * API route integration tests — invoke Next route handlers in-process (no HTTP server).
 * Uses an isolated SQLite file via DATABASE_PATH; closes DB in afterAll.
 *
 * @vitest-environment node
 */
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { closeDb } from "@/lib/db";
import { GET as getTemplateDemo } from "@/app/api/template/demo/route";
import { POST as postAstAnalyze } from "@/app/api/ast/analyze/route";
import { POST as postRagSearch } from "@/app/api/rag/search/route";
import { POST as postRagIndex } from "@/app/api/rag/index/route";
import { POST as postLogin } from "@/app/api/auth/login/route";
import { POST as postRegister } from "@/app/api/auth/register/route";
import { POST as postLogout } from "@/app/api/auth/logout/route";
import { POST as postStreamCompletion } from "@/app/api/code-completion/stream/route";
import { POST as postCodeCompletion } from "@/app/api/code-completion/route";

function req(url: string, init?: RequestInit & { json?: unknown }) {
  const { json, ...rest } = init ?? {};
  const body = json !== undefined ? JSON.stringify(json) : (rest as { body?: string }).body;
  return new NextRequest(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers as Record<string, string>),
    },
    body: body as string | undefined,
  });
}

const testRoot = join(tmpdir(), `vibecoder-api-int-${process.pid}-${Date.now()}`);
const testDbPath = join(testRoot, "integration.db");

beforeAll(() => {
  mkdirSync(testRoot, { recursive: true });
  process.env.DATABASE_PATH = testDbPath;
});

afterAll(() => {
  try {
    closeDb();
  } catch {
    /* ignore */
  }
  try {
    rmSync(testRoot, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

describe("GET /api/template/demo", () => {
  it("returns success and templateJson", async () => {
    const res = await getTemplateDemo();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.templateJson).toBeDefined();
    expect(Array.isArray(data.templateJson.items)).toBe(true);
  });
});

describe("POST /api/ast/analyze", () => {
  it("returns 400 for empty body", async () => {
    const res = await postAstAnalyze(req("http://localhost/api/ast/analyze", { method: "POST", body: "" }));
    expect(res.status).toBe(400);
  });

  it("returns graph payload for minimal valid files", async () => {
    const res = await postAstAnalyze(
      req("http://localhost/api/ast/analyze", {
        method: "POST",
        json: { files: [{ path: "a.ts", content: 'import x from "./b";' }] },
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("cycles");
    expect(data).toHaveProperty("warnings");
    expect(data).toHaveProperty("hasCycles");
  });
});

describe("POST /api/rag/* (validation only)", () => {
  it("search returns 400 without playgroundId", async () => {
    const res = await postRagSearch(
      req("http://localhost/api/rag/search", { method: "POST", json: { query: "hello" } })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/playgroundId/i);
  });

  it("search returns 200 for demo playground with empty index", async () => {
    const res = await postRagSearch(
      req("http://localhost/api/rag/search", {
        method: "POST",
        json: { query: "console", playgroundId: "demo", topK: 3 },
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.chunks)).toBe(true);
    expect(data.metadata).toBeDefined();
  });

  it("index returns 400 for empty files array", async () => {
    const res = await postRagIndex(
      req("http://localhost/api/rag/index", {
        method: "POST",
        json: { playgroundId: "demo", files: [] },
      })
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/* (JSON + SQLite)", () => {
  it("login returns 400 for invalid JSON", async () => {
    const res = await postLogin(
      req("http://localhost/api/auth/login", { method: "POST", body: "not-json" })
    );
    expect(res.status).toBe(400);
  });

  it("register returns 400 for invalid JSON", async () => {
    const res = await postRegister(
      req("http://localhost/api/auth/register", { method: "POST", body: "{broken" })
    );
    expect(res.status).toBe(400);
  });

  it("register then login succeeds with 200", async () => {
    const email = `int-${Date.now()}@example.test`;
    const password = "secret12";

    const reg = await postRegister(
      req("http://localhost/api/auth/register", {
        method: "POST",
        json: { email, password, name: "Integration" },
      })
    );
    expect(reg.status).toBe(200);

    const log = await postLogin(
      req("http://localhost/api/auth/login", {
        method: "POST",
        json: { email, password },
      })
    );
    expect(log.status).toBe(200);
    const body = await log.json();
    expect(body.user?.email).toBe(email);
  });

  it("register duplicate email returns 409", async () => {
    const email = `dup-${Date.now()}@example.test`;
    const password = "secret12";
    const first = await postRegister(
      req("http://localhost/api/auth/register", {
        method: "POST",
        json: { email, password, name: "A" },
      })
    );
    expect(first.status).toBe(200);
    const second = await postRegister(
      req("http://localhost/api/auth/register", {
        method: "POST",
        json: { email, password, name: "B" },
      })
    );
    expect(second.status).toBe(409);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears session cookie", async () => {
    const res = await postLogout();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toMatch(/vibecoder_session/i);
  });
});

describe("POST code completion (validation)", () => {
  it("stream returns 400 for invalid JSON", async () => {
    const res = await postStreamCompletion(
      req("http://localhost/api/code-completion/stream", { method: "POST", body: "[]" })
    );
    expect(res.status).toBe(400);
  });

  it("non-stream returns 400 for invalid JSON", async () => {
    const res = await postCodeCompletion(
      req("http://localhost/api/code-completion", { method: "POST", body: "{" })
    );
    expect(res.status).toBe(400);
  });
});
