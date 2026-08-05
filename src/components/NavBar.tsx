import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { LogoutButton } from "@/components/LogoutButton";

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          StudentNest
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/listings" className="btn-secondary">
            Browse listings
          </Link>

          {!user && (
            <>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}

          {user && (
            <>
              <Link href="/dashboard" className="btn-secondary">
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="btn-secondary">
                  Admin
                </Link>
              )}
              <span className="hidden text-zinc-500 sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
