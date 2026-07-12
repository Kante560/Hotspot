"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/8 bg-white/4 p-8 backdrop-blur-md shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Sign In
        </h1>
        <p className="text-sm text-text-secondary">
          Crime Hotspot Analysis System
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {registered && (
          <div className="rounded-md bg-success/10 p-3 text-sm text-success border border-success/20 text-center">
            Account created successfully! Please sign in.
          </div>
        )}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium text-text-primary" htmlFor="email">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="officer@police.ng"
            required
            className="h-auto w-full rounded-md border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus-visible:border-brand-primary focus-visible:ring-brand-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-text-primary" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="h-auto w-full rounded-md border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/20 focus-visible:border-brand-primary focus-visible:ring-brand-primary/50"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-auto w-full rounded-md bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand-primary hover:text-brand-accent transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden glow-brand">
      <Suspense
        fallback={
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/8 bg-white/4 p-8 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            </div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
