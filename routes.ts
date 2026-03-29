/**
 * Routes that do not require authentication (middleware allows without session).
 */
export const publicRoutes: string[] = ["/", "/dashboard", "/playground/demo"];

/**
 * Auth pages (sign-in, etc.): reachable when logged out; logged-in users are redirected away.
 */
export const authRoutes: string[] = ["/auth/sign-in"];

/** API auth routes skip middleware JWT checks; handlers validate themselves. */
export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
