import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  await requireRole("ADMIN");

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

  const tiles = [
    { label: "Total users", value: totalUsers },
    { label: "Students", value: students },
    { label: "Landlords/Agents", value: landlordsAgents },
    { label: "Total listings", value: totalListings },
    { label: "Pending review", value: pendingListings, highlight: pendingListings > 0 },
    { label: "Approved", value: approvedListings },
    { label: "Rejected", value: rejectedListings },
    { label: "Bookings (coming soon)", value: 0 },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Admin overview</h1>
        <Link href="/admin/listings" className="btn-primary">
          Review pending listings{pendingListings > 0 ? ` (${pendingListings})` : ""}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className={`card ${tile.highlight ? "border-amber-400" : ""}`}>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{tile.value}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{tile.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
