import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await requireSession();

  if (session.role === "ADMIN") {
    redirect("/admin");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true, role: true, verified: true, institution: { select: { name: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Welcome, {user.name.split(" ")[0]}</h1>

      {user.role === "STUDENT" && (
        <div className="mt-6 card">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Student account</h2>
          {user.institution && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Institution: {user.institution.name}
            </p>
          )}
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Browse verified listings near your campus. Messaging and booking requests
            are coming in the next release.
          </p>
          <Link href="/listings" className="btn-primary mt-4">
            Browse listings
          </Link>
        </div>
      )}

      {(user.role === "LANDLORD" || user.role === "AGENT") && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                {user.role === "LANDLORD" ? "Landlord" : "Agent"} account
              </h2>
              {user.verified ? (
                <span className="badge-approved">Verified</span>
              ) : (
                <span className="badge-pending">Verification pending</span>
              )}
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {user.verified
                ? "Your account is verified. Listings you submit still go through admin review before going live."
                : "An admin reviews new accounts manually. You can still create listings while you wait — they'll be queued for approval."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/listings/new" className="btn-primary">
                Create a listing
              </Link>
              <Link href="/listings/mine" className="btn-secondary">
                My listings
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
