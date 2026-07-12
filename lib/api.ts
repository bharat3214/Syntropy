import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status: 400 }
  );
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// Wraps a route handler body — catches Zod validation errors and unexpected
// errors so every route.ts doesn't repeat the same try/catch boilerplate.
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      return badRequest("Validation failed", err.flatten());
    }
    console.error(err);
    return serverError();
  }
}