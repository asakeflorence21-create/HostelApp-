import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20">
      <section className="flex flex-col items-start gap-6 text-left">
        <span className="badge-approved">Pilot launching at your university</span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Off-campus housing you can actually trust.
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          StudentNest connects students with landlords and verified agents near campus.
          Every listing is manually checked before it goes live — no fake photos, no
          disappearing agents.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/listings" className="btn-primary">
            Browse verified listings
          </Link>
          <Link href="/signup" className="btn-secondary">
            Create an account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">For students</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Search hostels, self-contained rooms, and shared apartments near your
            institution, filtered by budget and gender policy.
          </p>
        </div>
        <div className="card">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">For landlords</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            List your property with photos and amenities. Once approved, it&apos;s visible
            to students actively searching near your location.
          </p>
        </div>
        <div className="card">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">For agents</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage listings on behalf of multiple landlords, all under one verified
            profile students can trust.
          </p>
        </div>
      </section>
    </main>
  );
}
