import { describe, it, expect } from "vitest";
import { isValidEmail } from "@/lib/validation";

describe("isValidEmail", () => {
  it("accepts typical addresses", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("user.name+tag@example.com")).toBe(true);
  });

  it("rejects empty and whitespace-only", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("   ")).toBe(false);
  });

  it("rejects missing @ or domain", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("noat.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("rejects overly long strings", () => {
    expect(isValidEmail(`${"a".repeat(250)}@x.co`)).toBe(false);
  });
});
