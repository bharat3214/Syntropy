import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { calculateGoalProgress } from "@/lib/environmental/goals";

export interface DepartmentEnvironmentalSummary {
  departmentId: string;
  departmentName: string;
  departmentCode: string | null;
  totalCo2Kg: number;
  transactionCount: number;
  goalCount: number;
  environmentalScore: number | null; // null = no goals to score against
}

/**
 * Aggregates raw emissions + computes an Environmental Score for a single
 * department.
 *
 * Score methodology: average of that department's goal progress values.
 * Raw tonnage is NOT the score — a factory will always emit more than an
 * office by nature of what it does, so absolute CO2 isn't a fair 0-100
 * measure. Progress against self-set reduction targets is.
 *
 * A department with zero goals returns environmentalScore: null (not 0 —
 * absence of goals isn't the same as failing them).
 */
export async function getDepartmentEnvironmentalSummary(
  departmentId: string
): Promise<DepartmentEnvironmentalSummary> {
  const department = await prisma.department.findUniqueOrThrow({
    where: { id: departmentId },
  });

  const [transactions, goals] = await Promise.all([
    prisma.carbonTransaction.findMany({
      where: { departmentId },
      select: { co2Kg: true },
    }),
    prisma.environmentalGoal.findMany({
      where: { departmentId, status: { not: "ARCHIVED" } },
      select: { targetCo2Kg: true, currentCo2Kg: true },
    }),
  ]);

  const totalCo2Kg = transactions.reduce(
    (sum, t) => sum.add(t.co2Kg),
    new Prisma.Decimal(0)
  );

  const environmentalScore =
    goals.length === 0
      ? null
      : Math.round(
          goals.reduce(
            (sum, g) => sum + calculateGoalProgress(g.targetCo2Kg, g.currentCo2Kg),
            0
          ) / goals.length
        );

  return {
    departmentId: department.id,
    departmentName: department.name,
    departmentCode: department.code,
    totalCo2Kg: totalCo2Kg.toNumber(),
    transactionCount: transactions.length,
    goalCount: goals.length,
    environmentalScore,
  };
}

/**
 * Same summary, for every department — powers the "Department Carbon
 * Tracking" view and the department-comparison bar chart in the dashboard.
 */
export async function getAllDepartmentEnvironmentalSummaries(): Promise<
  DepartmentEnvironmentalSummary[]
> {
  const departments = await prisma.department.findMany({
    select: { id: true },
    orderBy: { name: "asc" },
  });

  return Promise.all(
    departments.map((d) => getDepartmentEnvironmentalSummary(d.id))
  );
}