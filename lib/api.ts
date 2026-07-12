import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

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

export function conflict(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 409 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

/**
 * Turns Prisma's error codes into messages a human can act on.
 * Without this, a duplicate product code or a blocked delete both surface as
 * an opaque 500, which is useless to the person using the app.
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError) {
  const target = (err.meta?.target as string[] | string | undefined) ?? [];
  const fields = Array.isArray(target) ? target.join(", ") : String(target);

  switch (err.code) {
    // Unique constraint violation
    case "P2002":
      return conflict(
        fields
          ? `A record with this ${fields} already exists.`
          : "A record with these values already exists."
      );

    // Foreign key constraint failed (e.g. deleting a referenced emission factor)
    case "P2003":
      return badRequest(
        "This record is referenced by other data and can't be deleted. Set it to Inactive instead."
      );

    // Record to update/delete does not exist
    case "P2025":
      return notFound("Record not found.");

    // Restrict violation on delete
    case "P2014":
      return badRequest(
        "This record is still referenced by other data and can't be deleted."
      );

    default:
      console.error("Unhandled Prisma error:", err.code, err.message);
      return serverError();
  }
}

/**
 * Wraps a route handler — catches Zod validation errors and Prisma errors so
 * every route.ts doesn't repeat the same try/catch.
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      return badRequest("Validation failed", err.flatten());
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return handlePrismaError(err);
    }

    console.error(err);
    return serverError();
  }
}