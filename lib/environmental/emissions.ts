import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Computes CO2 (kg) for a given activity amount against an Emission Factor.
 * Looks up the factor, multiplies, and returns both the factor and the result
 * so callers can persist/display both.
 */
export async function calculateCo2(
  emissionFactorId: string,
  activityAmount: number | Prisma.Decimal
) {
  const factor = await prisma.emissionFactor.findUnique({
    where: { id: emissionFactorId },
  });

  if (!factor) {
    throw new Error(`Emission factor ${emissionFactorId} not found`);
  }

  if (factor.status === "INACTIVE") {
    throw new Error(
      `Emission factor "${factor.name}" is inactive and cannot be used for new transactions`
    );
  }

  const amount = new Prisma.Decimal(activityAmount);
  const co2Kg = amount.mul(factor.co2PerUnit);

  return { factor, co2Kg };
}