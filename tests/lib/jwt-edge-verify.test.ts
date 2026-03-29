/** @vitest-environment node */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { signToken } from "@/lib/auth/jwt";
import { verifySessionJwtHs256Edge } from "@/lib/auth/jwt-edge-verify";

describe("jwt-edge-verify", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "edge-test-secret-minimum-length-ok!");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts tokens signed by lib/auth/jwt (jose)", async () => {
    const token = await signToken({ sub: "u1", email: "e@x.com", name: "E" });
    const ok = await verifySessionJwtHs256Edge(
      token,
      "edge-test-secret-minimum-length-ok!"
    );
    expect(ok).toBe(true);
  });

  it("rejects wrong secret", async () => {
    const token = await signToken({ sub: "u1", email: "e@x.com", name: "E" });
    expect(await verifySessionJwtHs256Edge(token, "other-secret-minimum-length-ok!")).toBe(false);
  });

  it("rejects malformed token", async () => {
    expect(await verifySessionJwtHs256Edge("x.y", "edge-test-secret-minimum-length-ok!")).toBe(false);
  });
});
