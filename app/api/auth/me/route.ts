import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email ?? null,
        name: payload.name ?? null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
