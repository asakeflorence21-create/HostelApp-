import { z } from "zod";
import { AMENITIES, GENDER_POLICIES, ROOM_TYPES, SIGNUP_ROLES } from "@/lib/constants";

// Nigerian phone numbers: optional +234/0 prefix, 10-11 digits.
const phoneRegex = /^(\+234|0)[0-9]{10}$/;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email.").trim().optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Enter a valid Nigerian phone number.")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-zA-Z]/, "Password must contain a letter.")
      .regex(/[0-9]/, "Password must contain a number."),
    role: z.enum(SIGNUP_ROLES),
    institutionId: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.email || data.phone, {
    error: "Provide an email or phone number.",
    path: ["email"],
  })
  .refine((data) => data.role !== "STUDENT" || !!data.institutionId, {
    error: "Select your institution.",
    path: ["institutionId"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1, "Enter your email or phone number."),
    password: z.string().min(1, "Enter your password."),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export const listingCreateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
  description: z.string().trim().min(20, "Description must be at least 20 characters."),
  price: z.coerce.number().int().positive("Price must be a positive number."),
  cautionFee: z.coerce.number().int().nonnegative().optional().nullable(),
  agencyFee: z.coerce.number().int().nonnegative().optional().nullable(),
  roomType: z.enum(ROOM_TYPES),
  genderPolicy: z.enum(GENDER_POLICIES),
  amenities: z.array(z.enum(AMENITIES)).default([]),
  address: z.string().trim().min(5, "Enter a street address."),
  city: z.string().trim().min(2, "Enter a city."),
  distanceFromCampusKm: z.coerce.number().nonnegative().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  institutionId: z.string().trim().min(1, "Select an institution."),
  photoUrls: z.array(z.string()).max(10, "Up to 10 photos.").default([]),
});

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;

export const listingModerationSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().trim().max(500).optional(),
});
