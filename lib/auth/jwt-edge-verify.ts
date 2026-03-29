/**
 * HS256 JWT verification using Web Crypto only — safe for Next.js Edge middleware.
 * Must stay aligned with `lib/auth/jwt.ts` (issuer, audience, HS256 compact form).
 */

const JWT_ISSUER = "vibecoder";
const JWT_AUDIENCE = "vibecoder";
const CLOCK_SKEW_SEC = 60;

function utf8Secret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function b64UrlToBytes(s: string): Uint8Array | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (b64.length % 4)) % 4;
    if (pad) b64 += "=".repeat(pad);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

function parseJsonPayload(segment: string): Record<string, unknown> | null {
  try {
    const raw = b64UrlToBytes(segment);
    if (!raw) return null;
    const text = new TextDecoder().decode(raw);
    const o = JSON.parse(text) as unknown;
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function parseHeader(segment: string): { alg?: string } | null {
  const p = parseJsonPayload(segment);
  return p as { alg?: string } | null;
}

/**
 * Returns true if the cookie value is a valid, non-expired session JWT for this app.
 */
export async function verifySessionJwtHs256Edge(
  token: string,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  if (!h || !p || !s) return false;

  const header = parseHeader(h);
  if (!header || header.alg !== "HS256") return false;

  const payload = parseJsonPayload(p);
  if (!payload) return false;

  if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) return false;

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (exp === null || exp < now - CLOCK_SKEW_SEC) return false;

  const keyMaterial = utf8Secret(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = new TextEncoder().encode(`${h}.${p}`);
  const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const expected = new Uint8Array(sigBuf);

  const got = b64UrlToBytes(s);
  if (!got) return false;

  return timingSafeEqual(expected, got);
}
