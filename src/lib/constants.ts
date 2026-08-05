// Mirrors the enums in prisma/schema.prisma. Kept as plain arrays (rather than
// importing the generated Prisma enums) so this file is safe to import from
// Client Components too.

export const ROLES = ["STUDENT", "LANDLORD", "AGENT", "ADMIN"] as const;
export type RoleValue = (typeof ROLES)[number];

// Roles a person can pick for themselves at signup — ADMIN accounts are
// created manually, never through the public form.
export const SIGNUP_ROLES = ["STUDENT", "LANDLORD", "AGENT"] as const;

export const ROOM_TYPES = ["HOSTEL", "SELF_CONTAINED", "ONE_BED", "SHARED"] as const;
export type RoomTypeValue = (typeof ROOM_TYPES)[number];
export const ROOM_TYPE_LABELS: Record<RoomTypeValue, string> = {
  HOSTEL: "Hostel",
  SELF_CONTAINED: "Self-contained",
  ONE_BED: "1-Bedroom",
  SHARED: "Shared room",
};

export const GENDER_POLICIES = ["MALE", "FEMALE", "MIXED"] as const;
export type GenderPolicyValue = (typeof GENDER_POLICIES)[number];
export const GENDER_POLICY_LABELS: Record<GenderPolicyValue, string> = {
  MALE: "Male only",
  FEMALE: "Female only",
  MIXED: "Mixed",
};

export const AMENITIES = [
  "WATER",
  "ELECTRICITY",
  "WIFI",
  "SECURITY",
  "FURNISHED",
  "PARKING",
  "KITCHEN",
  "GENERATOR",
] as const;
export type AmenityValue = (typeof AMENITIES)[number];
export const AMENITY_LABELS: Record<AmenityValue, string> = {
  WATER: "Water",
  ELECTRICITY: "Electricity (PHCN)",
  WIFI: "Wi-Fi",
  SECURITY: "Security",
  FURNISHED: "Furnished",
  PARKING: "Parking",
  KITCHEN: "Kitchen",
  GENERATOR: "Generator/backup power",
};

export const LISTING_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ListingStatusValue = (typeof LISTING_STATUSES)[number];
