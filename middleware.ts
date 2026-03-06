import { NextResponse, type NextRequest } from "next/server";
import * as jose from "jose";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
} from "@/routes";

const COOKIE_NAME = "vibecoder_session";
const JWT_ISSUER = "vibecoder";
const JWT_AUDIENCE = "vibecoder";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "vibecoder-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

async function isLoggedIn(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const secret = getSecret();
    await jose.jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Never redirect API routes from middleware. API routes should do their own auth.
  // This also prevents fetch() calls (e.g. templates) from being redirected to HTML pages.
  const isApiRoute = nextUrl.pathname.startsWith("/api/");
  if (isApiRoute) return response;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  if (isApiAuthRoute) return response;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const isLoggedInUser = await isLoggedIn(request);

  if (isAuthRoute && isLoggedInUser) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // Allow auth pages (e.g. /auth/sign-in) even when logged out.
  if (!isLoggedInUser && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", nextUrl));
  }

  return response;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
