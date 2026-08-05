import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { jsonError } from "@/lib/api-response";
import { LISTING_STATUSES, type ListingStatusValue } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return jsonError(403, "Admin access required.");
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status = LISTING_STATUSES.includes(statusParam as ListingStatusValue)
    ? (statusParam as ListingStatusValue)
    : "PENDING";

  const listings = await prisma.listing.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      roomType: true,
      genderPolicy: true,
      amenities: true,
      city: true,
      status: true,
      rejectionReason: true,
      institution: { select: { name: true } },
      owner: { select: { id: true, name: true, email: true, phone: true, role: true, verified: true } },
      photos: { select: { url: true }, orderBy: { position: "asc" } },
      createdAt: true,
    },
  });

  return NextResponse.json({ listings });
}
