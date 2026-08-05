"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(
          `Server returned an unexpected response (HTTP ${res.status}). If the app was recently idle, wait a moment and try again.`
        );
        return;
      }

      if (!res.ok) {
        setError(data.error || `Something went wrong (HTTP ${res.status}).`);
        return;
      }

      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="identifier" className="field-label">
          Email or phone number
        </label>
        <input id="identifier" name="identifier" required className="field-input" placeholder="you@example.com" />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" required className="field-input" />
      </div>

      {error && <p className="field-error">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary mt-2">
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="font-medium text-emerald-700 dark:text-emerald-400">
          Sign up
        </a>
      </p>
    </form>
  );
}
