import { describe, it, expect } from "vitest";
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from "@/routes";

describe("routes", () => {
  it("public routes include landing, dashboard, and demo playground", () => {
    expect(publicRoutes).toContain("/");
    expect(publicRoutes).toContain("/dashboard");
    expect(publicRoutes).toContain("/playground/demo");
  });

  it("auth routes include sign-in", () => {
    expect(authRoutes).toContain("/auth/sign-in");
  });

  it("api auth prefix is /api/auth", () => {
    expect(apiAuthPrefix).toBe("/api/auth");
  });

  it("default redirect after login is dashboard", () => {
    expect(DEFAULT_LOGIN_REDIRECT).toBe("/dashboard");
  });
});
