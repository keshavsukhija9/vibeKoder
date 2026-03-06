import { cookies } from "next/headers";
import { verifyToken, getCookieName } from "./jwt";

/**
 * Shape compatible with previous Supabase user usage (id, email, user_metadata).
 */
export type SessionUser = {
  id: string;
  email: string | null;
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const name = payload.name ?? payload.email ?? "User";
  return {
    id: payload.sub,
    email: payload.email ?? null,
    user_metadata: {
      full_name: name,
      name,
      avatar_url: "",
      picture: "",
    },
  };
}
