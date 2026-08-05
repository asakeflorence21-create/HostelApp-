import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { prisma } from "@/lib/db";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-pending",
  APPROVED: "badge-approved",
  REJECTED: "badge-rejected",
};

export default async function MyListingsPage() {
  const session = await requireSession();
  if (!["LANDLORD", "AGENT"].includes(session.role)) {
    redirect("/dashboard");
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

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My listings</h1>
        <Link href="/listings/new" className="btn-primary">
          + New listing
        </Link>
      </div>

      {listings.length === 0 && (
        <div className="card mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          You haven&apos;t created any listings yet.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.photos[0]?.url || "/window.svg"}
              alt={listing.title}
              className="h-24 w-full rounded-lg object-cover sm:w-32"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{listing.title}</h2>
                <span className={STATUS_BADGE[listing.status]}>{listing.status}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {listing.institution.name} · {listing.city} · ₦{listing.price.toLocaleString()}/year
              </p>
              {listing.status === "REJECTED" && listing.rejectionReason && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Rejected: {listing.rejectionReason}
                </p>
              )}
            </div>
            <Link href={`/listings/${listing.id}`} className="btn-secondary">
              View
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
