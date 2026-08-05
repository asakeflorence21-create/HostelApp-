import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { jsonError } from "@/lib/api-response";

const listingDetailSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  cautionFee: true,
  agencyFee: true,
  roomType: true,
  genderPolicy: true,
  amenities: true,
  address: true,
  city: true,
  distanceFromCampusKm: true,
  latitude: true,
  longitude: true,
  status: true,
  rejectionReason: true,
  institution: { select: { id: true, name: true, city: true, state: true } },
  owner: { select: { id: true, name: true, email: true, phone: true, role: true, verified: true } },
  photos: { select: { id: true, url: true }, orderBy: { position: "asc" as const } },
  createdAt: true,
};

export async function GET(_request: Request, ctx: RouteContext<"/api/listings/[id]">) {
  const { id } = await ctx.params;

  const listing = await prisma.listing.findUnique({ where: { id }, select: listingDetailSelect });
  if (!listing) {
    return jsonError(404, "Listing not found.");
  }

  if (listing.status !== "APPROVED") {
    // Non-public listings are only visible to their owner or an admin.
    const session = await getSession();
    const isOwner = session?.userId === listing.owner.id;
    const isAdmin = session?.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return jsonError(404, "Listing not found.");
    }
  }

  return NextResponse.json({ listing });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/listings/[id]">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session) {
    return jsonError(401, "Log in required.");
  }

  const listing = await prisma.listing.findUnique({ where: { id }, select: { ownerId: true } });
  if (!listing) {
    return jsonError(404, "Listing not found.");
  }

  const isOwner = listing.ownerId === session.userId;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return jsonError(403, "You don't have permission to remove this listing.");
  }

  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
