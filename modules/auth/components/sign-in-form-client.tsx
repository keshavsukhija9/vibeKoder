"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInFormClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password required");
      return;
    }
    if (isRegister && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const url = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body: { email: string; password: string; name?: string } = {
        email: email.trim(),
        password,
      };
      if (isRegister) body.name = name.trim() || email.split("@")[0] || "User";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || (isRegister ? "Registration failed" : "Login failed"));
        setLoading(false);
        return;
      }
      toast.success(isRegister ? "Account created" : "Signed in");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-1 px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-center text-[var(--vibe-text)]" style={{ fontFamily: "var(--font-display)" }}>
          {isRegister ? "Create account" : "Sign in"}
        </CardTitle>
        <CardDescription className="text-center text-[var(--vibe-text-muted)]">
          {isRegister
            ? "Enter your details to create an account"
            : "Sign in with your email and password"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4 px-0 pb-4">
          {isRegister && (
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={isRegister ? "Min 6 characters" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 6 : undefined}
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-[var(--vibe-primary)] to-[var(--vibe-secondary)] text-white shadow-lg hover:opacity-95 hover:shadow-[0_0_24px_rgba(30,95,168,0.35)]"
            disabled={loading}
          >
            {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 px-0 pb-0">
          <button
            type="button"
            className="text-sm text-[var(--vibe-text-muted)] hover:text-[var(--vibe-primary)] transition-colors"
            onClick={() => setIsRegister((r) => !r)}
          >
            {isRegister ? "Already have an account? Sign in" : "No account? Create one"}
          </button>
          <p className="text-xs text-center text-[var(--vibe-text-muted)]">
            By signing in, you agree to our{" "}
            <Link href="#" className="underline hover:text-[var(--vibe-primary)]">Terms of Service</Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-[var(--vibe-primary)]">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
