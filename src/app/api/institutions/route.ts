import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const institutions = await prisma.institution.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true, state: true },
  });
  return NextResponse.json({ institutions });
}
