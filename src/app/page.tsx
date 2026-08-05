import Link from "next/link";
import { SiteImage } from "@/components/SiteImage";

const ROLE_CARDS = [
  {
    src: "/images/for-students.jpg",
    alt: "Students walking together on campus",
    title: "For students",
    body: "Search hostels, self-contained rooms, and shared apartments near your institution, filtered by budget and gender policy.",
  },
  {
    src: "/images/for-landlords.jpg",
    alt: "Landlord handing over house keys",
    title: "For landlords",
    body: "List your property with photos and amenities. Once approved, it's visible to students actively searching near your location.",
  },
  {
    src: "/images/for-agents.jpg",
    alt: "Agent finalizing a property agreement",
    title: "For agents",
    badge: "Verified Agent",
    body: "Manage listings on behalf of multiple landlords, all under one verified profile students can trust.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6 text-left">
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
        </div>

        <SiteImage
          src="/images/hero-property.jpg"
          alt="Modern student housing property"
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] w-full rounded-2xl shadow-sm lg:aspect-square"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {ROLE_CARDS.map((role) => (
          <div
            key={role.src}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <SiteImage
              src={role.src}
              alt={role.alt}
              badge={role.badge}
              sizes="(min-width: 640px) 33vw, 100vw"
              className="aspect-video w-full"
            />
            <div className="p-5">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{role.title}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{role.body}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
