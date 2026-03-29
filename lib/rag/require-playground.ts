import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth/jwt";
import { getDb } from "@/lib/db";

export type RagPlaygroundAuth =
  | { ok: true; playgroundId: string }
  | { ok: false; response: NextResponse };

/**
 * RAG APIs: `demo` is public; other ids require a session and playground ownership.
 */
export async function requirePlaygroundForRag(bodyPlaygroundId: unknown): Promise<RagPlaygroundAuth> {
  if (typeof bodyPlaygroundId !== "string" || !bodyPlaygroundId.trim()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "playgroundId is required" }, { status: 400 }),
    };
  }
  const playgroundId = bodyPlaygroundId.trim();
  if (playgroundId === "demo") {
    return { ok: true, playgroundId };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  const session = token ? await verifyToken(token) : null;
  if (!session?.sub) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const db = getDb();
  const row = db
    .prepare("SELECT id FROM playgrounds WHERE id = ? AND user_id = ?")
    .get(playgroundId, session.sub) as { id: string } | undefined;
  if (!row) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Playground not found" }, { status: 404 }),
    };
  }

  return { ok: true, playgroundId };
}
