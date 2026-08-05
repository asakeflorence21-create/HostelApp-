import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { LISTING_STATUSES, type ListingStatusValue } from "@/lib/constants";
import { AdminListingQueue } from "@/components/AdminListingQueue";

export default async function AdminListingsPage(props: PageProps<"/admin/listings">) {
  await requireRole("ADMIN");

  const searchParams = await props.searchParams;
  const statusParam = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const status: ListingStatusValue = LISTING_STATUSES.includes(statusParam as ListingStatusValue)
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

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Listing moderation</h1>

      <div className="mt-4 flex gap-2">
        {LISTING_STATUSES.map((s) => (
          <a
            key={s}
            href={`/admin/listings?status=${s}`}
            className={s === status ? "btn-primary" : "btn-secondary"}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="card mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Nothing here right now.
        </div>
      ) : (
        <AdminListingQueue listings={listings} showActions={status === "PENDING"} />
      )}
    </main>
  );
}
