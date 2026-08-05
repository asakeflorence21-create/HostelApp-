"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  AMENITIES,
  AMENITY_LABELS,
  GENDER_POLICIES,
  GENDER_POLICY_LABELS,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
} from "@/lib/constants";

type Institution = { id: string; name: string };
type UploadedPhoto = { url: string; previewName: string };

export function ListingForm({ institutions }: { institutions: Institution[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amenities, setAmenities] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  function toggleAmenity(value: string) {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFormError(null);

    for (const file of Array.from(files)) {
      if (photos.length >= 10) break;
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || `Failed to upload ${file.name}.`);
          continue;
        }
        setPhotos((prev) => [...prev, { url: data.url, previewName: file.name }]);
      } catch {
        setFormError(`Failed to upload ${file.name}.`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p.url !== url));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const toNumberOrNull = (key: string) => {
      const value = formData.get(key);
      return value ? Number(value) : null;
    };

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      cautionFee: toNumberOrNull("cautionFee"),
      agencyFee: toNumberOrNull("agencyFee"),
      roomType: formData.get("roomType"),
      genderPolicy: formData.get("genderPolicy"),
      amenities: Array.from(amenities),
      address: formData.get("address"),
      city: formData.get("city"),
      distanceFromCampusKm: toNumberOrNull("distanceFromCampusKm"),
      institutionId: formData.get("institutionId"),
      photoUrls: photos.map((p) => p.url),
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        setFieldErrors(data.fieldErrors || {});
        return;
      }

      router.push("/listings/mine");
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="field-label">
          Listing title
        </label>
        <input id="title" name="title" required className="field-input" placeholder="Sunny self-contained near Gate 2" />
        {fieldErrors.title && <p className="field-error">{fieldErrors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Description
        </label>
        <textarea id="description" name="description" required rows={4} className="field-input" placeholder="Describe the property, nearby landmarks, house rules…" />
        {fieldErrors.description && <p className="field-error">{fieldErrors.description[0]}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="field-label">
            Price (₦/year)
          </label>
          <input id="price" name="price" type="number" min={0} required className="field-input" placeholder="250000" />
          {fieldErrors.price && <p className="field-error">{fieldErrors.price[0]}</p>}
        </div>
        <div>
          <label htmlFor="cautionFee" className="field-label">
            Caution fee (₦)
          </label>
          <input id="cautionFee" name="cautionFee" type="number" min={0} className="field-input" placeholder="Optional" />
        </div>
        <div>
          <label htmlFor="agencyFee" className="field-label">
            Agency fee (₦)
          </label>
          <input id="agencyFee" name="agencyFee" type="number" min={0} className="field-input" placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="roomType" className="field-label">
            Room type
          </label>
          <select id="roomType" name="roomType" required className="field-input" defaultValue="">
            <option value="" disabled>
              Select room type
            </option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {ROOM_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="genderPolicy" className="field-label">
            Gender policy
          </label>
          <select id="genderPolicy" name="genderPolicy" required className="field-input" defaultValue="">
            <option value="" disabled>
              Select gender policy
            </option>
            {GENDER_POLICIES.map((g) => (
              <option key={g} value={g}>
                {GENDER_POLICY_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className="field-label">Amenities</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            >
              <input
                type="checkbox"
                checked={amenities.has(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              {AMENITY_LABELS[amenity]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="institutionId" className="field-label">
            Nearest institution
          </label>
          <select id="institutionId" name="institutionId" required className="field-input" defaultValue="">
            <option value="" disabled>
              Select institution
            </option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
          {fieldErrors.institutionId && <p className="field-error">{fieldErrors.institutionId[0]}</p>}
        </div>
        <div>
          <label htmlFor="distanceFromCampusKm" className="field-label">
            Distance from campus (km)
          </label>
          <input
            id="distanceFromCampusKm"
            name="distanceFromCampusKm"
            type="number"
            min={0}
            step="0.1"
            className="field-input"
            placeholder="e.g. 1.2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className="field-label">
            Street address
          </label>
          <input id="address" name="address" required className="field-input" placeholder="12 Ransome-Kuti Road" />
          {fieldErrors.address && <p className="field-error">{fieldErrors.address[0]}</p>}
        </div>
        <div>
          <label htmlFor="city" className="field-label">
            City
          </label>
          <input id="city" name="city" required className="field-input" placeholder="Lagos" />
          {fieldErrors.city && <p className="field-error">{fieldErrors.city[0]}</p>}
        </div>
      </div>

      <div>
        <span className="field-label">Photos (up to 10)</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={uploading || photos.length >= 10}
          className="field-input"
        />
        {uploading && <p className="mt-1 text-sm text-zinc-500">Uploading…</p>}
        {photos.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((photo) => (
              <li key={photo.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded content, not a static asset */}
                <img src={photo.url} alt={photo.previewName} className="h-20 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.url)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                  aria-label={`Remove ${photo.previewName}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formError && <p className="field-error">{formError}</p>}

      <button type="submit" disabled={pending || uploading} className="btn-primary">
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
