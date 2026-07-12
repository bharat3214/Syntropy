import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, badRequest, notFound, withErrorHandling } from "@/lib/api";
import { emissionFactorUpdateSchema } from "@/validators/environmental";

type Params = { params: Promise<{ id: string }> };

// GET /api/environmental/emission-factors/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const factor = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!factor) return notFound("Emission factor not found");

    return ok(factor);
  });
}

// PATCH /api/environmental/emission-factors/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await req.json();
    const parsed = emissionFactorUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const existing = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!existing) return notFound("Emission factor not found");

    const updated = await prisma.emissionFactor.update({
      where: { id },
      data: parsed.data,
    });

    return ok(updated);
  });
}

// DELETE /api/environmental/emission-factors/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!existing) return notFound("Emission factor not found");

    // Blocked by onDelete: Restrict if transactions reference this factor —
    // deleting would orphan emissions data. Deactivate instead.
    const inUse = await prisma.carbonTransaction.count({
      where: { emissionFactorId: id },
    });
    if (inUse > 0) {
      return badRequest(
        `Cannot delete "${existing.name}" — ${inUse} carbon transaction${inUse === 1 ? "" : "s"} reference it. Set it to Inactive instead.`
      );
    }

    await prisma.emissionFactor.delete({ where: { id } });
    return ok({ id, deleted: true });
  });
}