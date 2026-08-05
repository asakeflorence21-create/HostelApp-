import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { jsonError } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || !["LANDLORD", "AGENT"].includes(session.role)) {
    return jsonError(401, "Only landlords and agents have listings.");
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      rejectionReason: true,
      city: true,
      institution: { select: { name: true } },
      photos: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
      createdAt: true,
    },
  });

  return NextResponse.json({ listings });
}
