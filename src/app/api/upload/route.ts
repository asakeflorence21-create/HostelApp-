import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { jsonError } from "@/lib/api-response";

// Phase 1 stores uploads on local disk under /public/uploads. Render/Railway
// disks are ephemeral across deploys — swap this for S3/Cloudinary before
// scaling past the pilot.
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !["LANDLORD", "AGENT", "ADMIN"].includes(session.role)) {
    return jsonError(401, "You must be logged in as a landlord or agent to upload photos.");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError(400, "No file provided.");
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return jsonError(400, "Only JPEG, PNG, or WebP images are allowed.");
  }

  if (file.size > MAX_BYTES) {
    return jsonError(400, "Image must be smaller than 5MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
