"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SIGNUP_ROLES, type RoleValue } from "@/lib/constants";

type Institution = { id: string; name: string };

const ROLE_LABELS: Record<(typeof SIGNUP_ROLES)[number], string> = {
  STUDENT: "Student",
  LANDLORD: "Landlord",
  AGENT: "Verified agent",
};

export function SignupForm({ institutions }: { institutions: Institution[] }) {
  const router = useRouter();
  const [role, setRole] = useState<RoleValue>("STUDENT");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role,
      institutionId: formData.get("institutionId"),
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { error?: string; fieldErrors?: Record<string, string[]> } = {};
      try {
        data = await res.json();
      } catch {
        setFormError(
          `Server returned an unexpected response (HTTP ${res.status}). If the app was recently idle, wait a moment and try again.`
        );
        return;
      }

      if (!res.ok) {
        setFormError(data.error || `Something went wrong (HTTP ${res.status}).`);
        setFieldErrors(data.fieldErrors || {});
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <span className="field-label">I am a…</span>
        <div className="grid grid-cols-3 gap-2">
          {SIGNUP_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={role === r ? "btn-primary" : "btn-secondary"}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="name" className="field-label">
          Full name
        </label>
        <input id="name" name="name" required className="field-input" placeholder="Ada Lovelace" />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" name="email" type="email" className="field-input" placeholder="you@example.com" />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="field-label">
          Phone number
        </label>
        <input id="phone" name="phone" className="field-input" placeholder="080XXXXXXXX" />
        <p className="mt-1 text-xs text-zinc-500">Provide at least one: email or phone.</p>
        {fieldErrors.phone && <p className="field-error">{fieldErrors.phone[0]}</p>}
      </div>

      {role === "STUDENT" && (
        <div>
          <label htmlFor="institutionId" className="field-label">
            Institution
          </label>
          <select id="institutionId" name="institutionId" required className="field-input" defaultValue="">
            <option value="" disabled>
              Select your institution
            </option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
          {fieldErrors.institutionId && <p className="field-error">{fieldErrors.institutionId[0]}</p>}
        </div>
      )}

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="field-input"
          placeholder="At least 8 characters"
        />
        {fieldErrors.password && <p className="field-error">{fieldErrors.password[0]}</p>}
      </div>

      {formError && <p className="field-error">{formError}</p>}

      <button type="submit" disabled={pending} className="btn-primary mt-2">
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-emerald-700 dark:text-emerald-400">
          Log in
        </a>
      </p>
    </form>
  );
}
