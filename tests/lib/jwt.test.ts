/** @vitest-environment node */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/jwt";

describe("jwt", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "vitest-jwt-secret-min-32-chars!!");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signs and verifies payload", async () => {
    const token = await signToken({
      sub: "user-1",
      email: "u@example.com",
      name: "U",
    });
    const payload = await verifyToken(token);
    expect(payload?.sub).toBe("user-1");
    expect(payload?.email).toBe("u@example.com");
  });

  it("verifyToken returns null for garbage", async () => {
    expect(await verifyToken("")).toBeNull();
    expect(await verifyToken("not.a.jwt")).toBeNull();
  });

  it("rejects token signed with a different secret", async () => {
    const token = await signToken({ sub: "a", email: "a@b.c" });
    vi.unstubAllEnvs();
    vi.stubEnv("JWT_SECRET", "different-secret-also-32-chars!!");
    expect(await verifyToken(token)).toBeNull();
  });
});
