import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signToken, getCookieName } from "@/lib/auth/jwt";
import { readJsonBody } from "@/lib/api-errors";
import { isValidEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const parsed = await readJsonBody<{ email?: string; password?: string }>(req);
    if (parsed.errorResponse) return parsed.errorResponse;
    const body = parsed.body;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const db = getDb();
    const row = db.prepare(
      "SELECT id, email, name, password_hash FROM users WHERE email = ?"
    ).get(email) as { id: string; email: string; name: string; password_hash: string } | undefined;

    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({ sub: row.id, email: row.email, name: row.name });
    const res = NextResponse.json({ user: { id: row.id, email: row.email, name: row.name } });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
