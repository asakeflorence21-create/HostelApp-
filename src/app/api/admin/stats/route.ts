import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { jsonError } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return jsonError(403, "Admin access required.");
  }

  const [totalUsers, students, landlordsAgents, totalListings, pendingListings, approvedListings, rejectedListings] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: { in: ["LANDLORD", "AGENT"] } } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "PENDING" } }),
      prisma.listing.count({ where: { status: "APPROVED" } }),
      prisma.listing.count({ where: { status: "REJECTED" } }),
    ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      students,
      landlordsAgents,
      totalListings,
      pendingListings,
      approvedListings,
      rejectedListings,
      // Bookings ship in a later pass.
      totalBookings: 0,
    },
  });
}
