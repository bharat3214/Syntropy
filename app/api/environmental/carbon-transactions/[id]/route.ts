import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, badRequest, notFound, withErrorHandling } from "@/lib/api";
import { carbonTransactionUpdateSchema } from "@/validators/environmental";
import { calculateCo2 } from "@/lib/environmental/emissions";

type Params = { params: Promise<{ id: string }> };

// GET /api/environmental/carbon-transactions/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const transaction = await prisma.carbonTransaction.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        emissionFactor: { select: { id: true, name: true, unit: true } },
      },
    });
    if (!transaction) return notFound("Carbon transaction not found");

    return ok(transaction);
  });
}

// PATCH /api/environmental/carbon-transactions/[id]
// If activityAmount or emissionFactorId changes, co2Kg is recomputed server-side.
export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await req.json();
    const parsed = carbonTransactionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const existing = await prisma.carbonTransaction.findUnique({ where: { id } });
    if (!existing) return notFound("Carbon transaction not found");

    const data = parsed.data;
    const needsRecalc =
      data.activityAmount !== undefined || data.emissionFactorId !== undefined;

    let co2Kg = existing.co2Kg;
    if (needsRecalc) {
      const emissionFactorId = data.emissionFactorId ?? existing.emissionFactorId;
      const activityAmount = data.activityAmount ?? existing.activityAmount;

      try {
        ({ co2Kg } = await calculateCo2(emissionFactorId, activityAmount));
      } catch (err) {
        return badRequest((err as Error).message);
      }
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) return badRequest("Invalid departmentId");
    }

    const updated = await prisma.carbonTransaction.update({
      where: { id },
      data: {
        ...data,
        transactionDate: data.transactionDate
          ? new Date(data.transactionDate)
          : undefined,
        co2Kg,
      },
    });

    return ok(updated);
  });
}

// DELETE /api/environmental/carbon-transactions/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.carbonTransaction.findUnique({ where: { id } });
    if (!existing) return notFound("Carbon transaction not found");

    await prisma.carbonTransaction.delete({ where: { id } });

    return ok({ id, deleted: true });
  });
}