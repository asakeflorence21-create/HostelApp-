import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession, type SessionPayload } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * Data Access Layer entry point. Memoized per request so multiple calls
 * during a single render only decrypt the cookie once.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return readSession();
});

/** Use in Server Components/pages that must not render without a session. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/** Use in Server Components/pages that must not render for the wrong role. */
export async function requireRole(...roles: SessionPayload["role"][]): Promise<SessionPayload> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Full user record for the current session, re-checked against the
 * database (not just the JWT claims). Returns null if the session is
 * stale (e.g. the user was deleted).
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      verified: true,
      institutionId: true,
    },
  });
});
