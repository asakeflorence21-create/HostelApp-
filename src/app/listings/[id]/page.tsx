import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/dal";
import {
  AMENITY_LABELS,
  GENDER_POLICY_LABELS,
  ROOM_TYPE_LABELS,
  type AmenityValue,
  type GenderPolicyValue,
  type RoomTypeValue,
} from "@/lib/constants";
import { DeleteListingButton } from "@/components/DeleteListingButton";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-pending",
  APPROVED: "badge-approved",
  REJECTED: "badge-rejected",
};

export default async function ListingDetailPage(props: PageProps<"/listings/[id]">) {
  const { id } = await props.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      institution: true,
      owner: { select: { id: true, name: true, email: true, phone: true, role: true, verified: true } },
      photos: { orderBy: { position: "asc" } },
    },
  });

  if (!listing) notFound();

  const session = await getSession();
  const isOwner = session?.userId === listing.owner.id;
  const isAdmin = session?.role === "ADMIN";

  if (listing.status !== "APPROVED" && !isOwner && !isAdmin) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      {(isOwner || isAdmin) && listing.status !== "APPROVED" && (
        <div className="mb-4 flex items-center gap-2">
          <span className={STATUS_BADGE[listing.status]}>{listing.status}</span>
          {listing.status === "REJECTED" && listing.rejectionReason && (
            <span className="text-sm text-red-600 dark:text-red-400">Reason: {listing.rejectionReason}</span>
          )}
        </div>
      )}

      {listing.photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {listing.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.url} alt={listing.title} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      ) : (
        <div className="card text-center text-sm text-zinc-500">No photos yet.</div>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{listing.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {listing.address}, {listing.city} · near {listing.institution.name}
            {listing.distanceFromCampusKm != null && ` (${listing.distanceFromCampusKm}km away)`}
          </p>
        </div>
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
          ₦{listing.price.toLocaleString()}
          <span className="text-sm font-normal text-zinc-500">/year</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="badge bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {ROOM_TYPE_LABELS[listing.roomType as RoomTypeValue]}
        </span>
        <span className="badge bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
          {GENDER_POLICY_LABELS[listing.genderPolicy as GenderPolicyValue]}
        </span>
        {listing.cautionFee != null && (
          <span className="badge bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            Caution ₦{listing.cautionFee.toLocaleString()}
          </span>
        )}
        {listing.agencyFee != null && (
          <span className="badge bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            Agency ₦{listing.agencyFee.toLocaleString()}
          </span>
        )}
      </div>

      <div className="card mt-6">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">{listing.description}</p>
      </div>

      {listing.amenities.length > 0 && (
        <div className="card mt-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Amenities</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.amenities.map((amenity) => (
              <span key={amenity} className="badge bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                {AMENITY_LABELS[amenity as AmenityValue]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Contact</h2>
          {listing.owner.verified && <span className="badge-approved">Verified {listing.owner.role.toLowerCase()}</span>}
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{listing.owner.name}</p>
        {listing.owner.email && <p className="text-sm text-zinc-600 dark:text-zinc-400">{listing.owner.email}</p>}
        {listing.owner.phone && <p className="text-sm text-zinc-600 dark:text-zinc-400">{listing.owner.phone}</p>}
        <p className="mt-3 text-xs text-zinc-500">
          Direct messaging and booking requests are landing in the next release — reach out using the details above for now.
        </p>
      </div>

      {(isOwner || isAdmin) && (
        <div className="mt-4">
          <DeleteListingButton listingId={listing.id} redirectTo={isAdmin ? "/admin/listings" : "/listings/mine"} />
        </div>
      )}
    </main>
  );
}
