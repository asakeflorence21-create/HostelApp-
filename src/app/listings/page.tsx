import Link from "next/link";
import { prisma } from "@/lib/db";
import { ROOM_TYPE_LABELS, GENDER_POLICY_LABELS, type RoomTypeValue, type GenderPolicyValue } from "@/lib/constants";

export default async function ListingsPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      roomType: true,
      genderPolicy: true,
      city: true,
      distanceFromCampusKm: true,
      institution: { select: { name: true } },
      owner: { select: { verified: true } },
      photos: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Verified listings</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Search and filters are landing in the next release — for now, here&apos;s everything an admin has approved.
      </p>

      {listings.length === 0 && (
        <div className="card mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          No approved listings yet. Check back soon.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listings/${listing.id}`} className="card flex flex-col gap-2 hover:shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.photos[0]?.url || "/window.svg"}
              alt={listing.title}
              className="h-40 w-full rounded-lg object-cover"
            />
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{listing.title}</h2>
              {listing.owner.verified && <span className="badge-approved shrink-0">Verified</span>}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {listing.institution.name} · {listing.city}
              {listing.distanceFromCampusKm != null && ` · ${listing.distanceFromCampusKm}km from campus`}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {ROOM_TYPE_LABELS[listing.roomType as RoomTypeValue]} · {GENDER_POLICY_LABELS[listing.genderPolicy as GenderPolicyValue]}
            </p>
            <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
              ₦{listing.price.toLocaleString()}/year
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
