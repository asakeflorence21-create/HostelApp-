import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonError(status: number, message: string, fieldErrors?: Record<string, string[] | undefined>) {
  return NextResponse.json({ error: message, fieldErrors }, { status });
}

export function zodJsonError(error: ZodError) {
  const flattened = error.flatten();
  return jsonError(400, "Validation failed.", flattened.fieldErrors as Record<string, string[] | undefined>);
}
