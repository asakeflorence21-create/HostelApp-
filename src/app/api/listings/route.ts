import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { listingCreateSchema } from "@/lib/validation";
import { jsonError, zodJsonError } from "@/lib/api-response";

const listingSummarySelect = {
  id: true,
  title: true,
  price: true,
  roomType: true,
  genderPolicy: true,
  amenities: true,
  city: true,
  distanceFromCampusKm: true,
  status: true,
  institution: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true, role: true, verified: true } },
  photos: { select: { id: true, url: true }, orderBy: { position: "asc" as const }, take: 1 },
  createdAt: true,
};

/** Public browse: approved listings only, optionally scoped to an institution. */
export async function GET(request: NextRequest) {
  const institutionId = request.nextUrl.searchParams.get("institutionId");

  const listings = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      ...(institutionId ? { institutionId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: listingSummarySelect,
  });

  return NextResponse.json({ listings });
}

/** Landlord/agent creates a listing. Starts in PENDING until an admin approves it. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !["LANDLORD", "AGENT"].includes(session.role)) {
    return jsonError(401, "Only landlords and agents can create listings.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Request body must be JSON.");
  }

  const parsed = listingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return zodJsonError(parsed.error);
  }

  const institution = await prisma.institution.findUnique({ where: { id: parsed.data.institutionId } });
  if (!institution) {
    return jsonError(400, "Selected institution was not found.", { institutionId: ["Institution not found."] });
  }

  const { photoUrls, ...listingData } = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      ...listingData,
      ownerId: session.userId,
      photos: {
        create: photoUrls.map((url, index) => ({ url, position: index })),
      },
    },
    select: listingSummarySelect,
  });

  return NextResponse.json({ listing }, { status: 201 });
}
