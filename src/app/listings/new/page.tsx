import { redirect } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ListingForm } from "@/components/ListingForm";

export default async function NewListingPage() {
  const session = await requireSession();
  if (!["LANDLORD", "AGENT"].includes(session.role)) {
    redirect("/dashboard");
  }

  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create a listing</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Your listing goes to an admin for review before it&apos;s visible to students.
      </p>
      <div className="card mt-6">
        <ListingForm institutions={institutions} />
      </div>
    </main>
  );
}
