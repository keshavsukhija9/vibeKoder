import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  publicRoutes,
  authRoutes,
} from "@/routes";
import { verifySessionJwtHs256Edge } from "@/lib/auth/jwt-edge-verify";

const COOKIE_NAME = "vibecoder_session";

function getJwtSecretString(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    "vibecoder-dev-secret-change-in-production"
  );
}

async function isLoggedIn(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionJwtHs256Edge(token, getJwtSecretString());
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
