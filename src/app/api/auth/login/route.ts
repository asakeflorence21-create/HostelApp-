import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { jsonError, zodJsonError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return zodJsonError(parsed.error);
  }

  const identifier = parsed.data.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: parsed.data.identifier.trim() }],
    },
  });

  // Same generic error whether the identifier or password is wrong, so we
  // don't leak which accounts exist.
  if (!user) {
    return jsonError(401, "Invalid credentials.");
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return jsonError(401, "Invalid credentials.");
  }

  await createSession(user.id, user.role);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      institutionId: user.institutionId,
    },
  });
}
