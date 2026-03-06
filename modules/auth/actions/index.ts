"use server";

import { getSessionUser } from "@/lib/auth/session";

/** Returns current user from JWT cookie (SQLite-backed auth). Compatible shape with previous Supabase user. */
export const currentUser = async () => {
  return getSessionUser();
};
