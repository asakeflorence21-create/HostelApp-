import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { jsonError, zodJsonError } from "@/lib/api-response";
import { listingModerationSchema } from "@/lib/validation";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/listings/[id]">) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return jsonError(403, "Admin access required.");
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  const parsed = listingModerationSchema.safeParse(body);
  if (!parsed.success) {
    return zodJsonError(parsed.error);
  }

  const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true } });
  if (!listing) {
    return jsonError(404, "Listing not found.");
  }

  const updated = await prisma.listing.update({
    where: { id },
    data:
      parsed.data.action === "APPROVE"
        ? { status: "APPROVED", rejectionReason: null }
        : { status: "REJECTED", rejectionReason: parsed.data.rejectionReason || "Not specified." },
    select: { id: true, status: true, rejectionReason: true },
  });

  return NextResponse.json({ listing: updated });
}
