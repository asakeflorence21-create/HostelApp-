import { prisma } from "@/lib/db";
import { SignupForm } from "@/components/SignupForm";

export default async function SignupPage() {
  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Students, landlords, and agents all sign up here.
        </p>
        <SignupForm institutions={institutions} />
      </div>
    </main>
  );
}
