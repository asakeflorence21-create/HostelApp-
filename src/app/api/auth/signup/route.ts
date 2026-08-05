import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { signupSchema } from "@/lib/validation";
import { jsonError, zodJsonError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return zodJsonError(parsed.error);
  }

  const { name, password, role } = parsed.data;
  const email = parsed.data.email ? parsed.data.email.toLowerCase() : null;
  const phone = parsed.data.phone || null;
  const institutionId = role === "STUDENT" ? parsed.data.institutionId || null : null;

  if (institutionId) {
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) {
      return jsonError(400, "Selected institution was not found.", { institutionId: ["Institution not found."] });
    }
  }

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError(409, "An account with that email already exists.", {
        email: ["Email already in use."],
      });
    }
  }
  if (phone) {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return jsonError(409, "An account with that phone number already exists.", {
        phone: ["Phone number already in use."],
      });
    }
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role,
      institutionId,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, verified: true, institutionId: true },
  });

  await createSession(user.id, user.role);

  return NextResponse.json({ user }, { status: 201 });
}
