import { Prisma } from "@prisma/client";

type GoalStatus = "ACTIVE" | "ON_TRACK" | "AT_RISK" | "COMPLETED" | "ARCHIVED";

/**
 * Progress = how far current CO2 has come down toward the target,
 * expressed as current/target — verified against the wireframe examples:
 *   Target 500t, Current 390t  -> 390/500  = 78%
 *   Target 120t, Current 98t   -> 98/120   = 82% (rounds from 81.7)
 *   Target 80t,  Current 80t   -> 80/80    = 100%
 *
 * This reads as "emissions reduced to X% of the original target ceiling."
 * Progress is capped at 100 (can't exceed the goal) and floored at 0.
 */
export function calculateGoalProgress(
  targetCo2Kg: number | Prisma.Decimal,
  currentCo2Kg: number | Prisma.Decimal
): number {
  const target = new Prisma.Decimal(targetCo2Kg);
  const current = new Prisma.Decimal(currentCo2Kg);

  if (target.lte(0)) return 0;

  const progress = current.div(target).mul(100);
  const clamped = Prisma.Decimal.max(0, Prisma.Decimal.min(100, progress));

  return Math.round(clamped.toNumber());
}

/**
 * Derives status from progress + deadline, unless the goal has been
 * manually set to ARCHIVED (which always wins — archiving is an explicit
 * admin action and shouldn't be overridden by auto-derivation).
 */
export function deriveGoalStatus(
  progress: number,
  deadline: Date,
  currentStatus: GoalStatus
): GoalStatus {
  if (currentStatus === "ARCHIVED") return "ARCHIVED";
  if (progress >= 100) return "COMPLETED";

  const isPastDeadline = deadline.getTime() < Date.now();
  if (isPastDeadline) return "AT_RISK";

  return progress >= 80 ? "ON_TRACK" : "ACTIVE";
}