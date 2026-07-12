import { ok, withErrorHandling } from "@/lib/api";
import { getEnvironmentalDashboardSummary } from "@/lib/environmental/dashboard-summary";

// GET /api/environmental/dashboard
// Org-wide totals + 12-month emissions trend + source-type breakdown.
// Powers the Environmental Dashboard (PS §6) and feeds the "Emissions
// Trend (12 mo)" chart on the executive Dashboard wireframe.
export async function GET() {
  return withErrorHandling(async () => {
    const summary = await getEnvironmentalDashboardSummary();
    return ok(summary);
  });
}