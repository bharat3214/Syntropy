import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface MonthlyEmissions {
  month: string; // "2026-01"
  co2Kg: number;
}

export interface SourceTypeBreakdown {
  sourceType: string;
  co2Kg: number;
  transactionCount: number;
}

export interface EnvironmentalDashboardSummary {
  totalCo2Kg: number;
  totalTransactions: number;
  activeGoals: number;
  completedGoals: number;
  atRiskGoals: number;
  monthlyTrend: MonthlyEmissions[]; // last 12 months, oldest first
  bySourceType: SourceTypeBreakdown[];
}

/**
 * Org-wide Environmental dashboard data — powers the "Emissions Trend (12 mo)"
 * chart and the top-level KPI tiles in the wireframe.
 *
 * Trend is computed in JS (group-by-month over fetched rows) rather than a
 * raw SQL date_trunc, since hackathon data volume is small and this keeps
 * the whole module on Prisma's query builder — no raw SQL to explain.
 */
export async function getEnvironmentalDashboardSummary(): Promise<EnvironmentalDashboardSummary> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [transactions, goals] = await Promise.all([
    prisma.carbonTransaction.findMany({
      where: { transactionDate: { gte: twelveMonthsAgo } },
      select: { co2Kg: true, transactionDate: true, sourceType: true },
    }),
    prisma.environmentalGoal.findMany({
      select: { status: true },
    }),
  ]);

  // --- totals ---
  const totalCo2Kg = transactions.reduce(
    (sum, t) => sum.add(t.co2Kg),
    new Prisma.Decimal(0)
  );

  // --- monthly trend, last 12 months, zero-filled for months with no data ---
  const monthBuckets = new Map<string, Prisma.Decimal>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets.set(key, new Prisma.Decimal(0));
  }

  for (const t of transactions) {
    const d = t.transactionDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthBuckets.get(key);
    if (existing !== undefined) {
      monthBuckets.set(key, existing.add(t.co2Kg));
    }
  }

  const monthlyTrend: MonthlyEmissions[] = Array.from(monthBuckets.entries()).map(
    ([month, co2Kg]) => ({ month, co2Kg: co2Kg.toNumber() })
  );

  // --- breakdown by source type ---
  const sourceBuckets = new Map<string, { co2Kg: Prisma.Decimal; count: number }>();
  for (const t of transactions) {
    const existing = sourceBuckets.get(t.sourceType) ?? {
      co2Kg: new Prisma.Decimal(0),
      count: 0,
    };
    sourceBuckets.set(t.sourceType, {
      co2Kg: existing.co2Kg.add(t.co2Kg),
      count: existing.count + 1,
    });
  }

  const bySourceType: SourceTypeBreakdown[] = Array.from(sourceBuckets.entries()).map(
    ([sourceType, { co2Kg, count }]) => ({
      sourceType,
      co2Kg: co2Kg.toNumber(),
      transactionCount: count,
    })
  );

  // --- goal status counts ---
  const activeGoals = goals.filter((g) => g.status === "ACTIVE" || g.status === "ON_TRACK").length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const atRiskGoals = goals.filter((g) => g.status === "AT_RISK").length;

  return {
    totalCo2Kg: totalCo2Kg.toNumber(),
    totalTransactions: transactions.length,
    activeGoals,
    completedGoals,
    atRiskGoals,
    monthlyTrend,
    bySourceType,
  };
}