import * as jose from "jose";

const COOKIE_NAME = "vibecoder_session";
const JWT_ISSUER = "vibecoder";
const JWT_AUDIENCE = "vibecoder";
const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || "vibecoder-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export type JWTPayload = {
  sub: string; // user id
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
};

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">, maxAgeSec = DEFAULT_MAX_AGE_SEC): Promise<string> {
  const secret = getSecret();
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}
