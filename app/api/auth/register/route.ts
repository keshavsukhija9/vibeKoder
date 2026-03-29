import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signToken, getCookieName } from "@/lib/auth/jwt";
import { randomUUID } from "crypto";
import { readJsonBody } from "@/lib/api-errors";
import { isValidEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const parsed = await readJsonBody<{ email?: string; password?: string; name?: string }>(req);
    if (parsed.errorResponse) return parsed.errorResponse;
    const body = parsed.body;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : email.split("@")[0] || "User";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const id = randomUUID();
    const password_hash = await hashPassword(password);
    db.prepare(
      "INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
    ).run(id, email, name, password_hash);

    const token = await signToken({ sub: id, email, name });
    const res = NextResponse.json({ user: { id, email, name } });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
