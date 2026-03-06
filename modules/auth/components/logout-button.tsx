import React from "react";
import { LogoutButtonProps } from "../types";
import { useRouter } from "next/navigation";

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <span className="cursor-pointer" onClick={onLogout}>
      {children}
    </span>
  );
};

export default LogoutButton;
