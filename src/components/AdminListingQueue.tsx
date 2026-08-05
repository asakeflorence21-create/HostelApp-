"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AMENITY_LABELS,
  GENDER_POLICY_LABELS,
  ROOM_TYPE_LABELS,
  type AmenityValue,
  type GenderPolicyValue,
  type RoomTypeValue,
} from "@/lib/constants";

type AdminListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  roomType: string;
  genderPolicy: string;
  amenities: string[];
  city: string;
  status: string;
  rejectionReason: string | null;
  institution: { name: string };
  owner: { id: string; name: string; email: string | null; phone: string | null; role: string; verified: boolean };
  photos: { url: string }[];
  createdAt: Date;
};

export function AdminListingQueue({ listings, showActions }: { listings: AdminListing[]; showActions: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(listings);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function moderate(id: string, action: "APPROVE" | "REJECT") {
    let rejectionReason: string | undefined;
    if (action === "REJECT") {
      rejectionReason = prompt("Reason for rejection (shown to the landlord/agent):") || undefined;
      if (rejectionReason === undefined) return; // cancelled
    }

    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update listing.");
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {items.map((listing) => (
        <div key={listing.id} className="card flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/listings/${listing.id}`} className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50">
                {listing.title}
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {listing.institution.name} · {listing.city} · ₦{listing.price.toLocaleString()}/year
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {ROOM_TYPE_LABELS[listing.roomType as RoomTypeValue]} ·{" "}
                {GENDER_POLICY_LABELS[listing.genderPolicy as GenderPolicyValue]}
              </p>
            </div>
            {listing.photos[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.photos[0].url} alt={listing.title} className="h-20 w-28 rounded-lg object-cover" />
            )}
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">{listing.description}</p>

          {listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.amenities.map((amenity) => (
                <span key={amenity} className="badge bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {AMENITY_LABELS[amenity as AmenityValue]}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Owner: {listing.owner.name} ({listing.owner.role.toLowerCase()})
              {listing.owner.verified ? " · verified" : " · not verified"}
              {listing.owner.email && ` · ${listing.owner.email}`}
              {listing.owner.phone && ` · ${listing.owner.phone}`}
            </p>

            {listing.status === "REJECTED" && listing.rejectionReason && (
              <p className="text-sm text-red-600 dark:text-red-400">Reason: {listing.rejectionReason}</p>
            )}

            {showActions && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moderate(listing.id, "APPROVE")}
                  disabled={pendingId === listing.id}
                  className="btn-primary"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => moderate(listing.id, "REJECT")}
                  disabled={pendingId === listing.id}
                  className="btn-danger"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
