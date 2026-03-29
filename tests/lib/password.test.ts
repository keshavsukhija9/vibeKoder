import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password", () => {
  it("round-trips hash and verify", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", stored)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const stored = await hashPassword("secret123");
    expect(await verifyPassword("wrong", stored)).toBe(false);
  });

  it("rejects malformed stored hash", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "no-colon")).toBe(false);
    expect(await verifyPassword("x", "onlysalt:")).toBe(false);
  });
});
