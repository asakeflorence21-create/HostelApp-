"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteListingButton({ listingId, redirectTo }: { listingId: string; redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this listing? This can't be undone.")) return;
    setPending(true);
    const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    setPending(false);
    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={handleDelete} disabled={pending} className="btn-danger">
      {pending ? "Removing…" : "Remove listing"}
    </button>
  );
}
