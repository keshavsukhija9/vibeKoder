import { useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user ?? null);
      })
      .catch(() => setUser(null));
  }, []);

  return user;
};
