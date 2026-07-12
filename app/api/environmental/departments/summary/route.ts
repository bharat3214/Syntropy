import { NextRequest } from "next/server";
import { ok, notFound, withErrorHandling } from "@/lib/api";
import {
  getDepartmentEnvironmentalSummary,
  getAllDepartmentEnvironmentalSummaries,
} from "@/lib/environmental/department-summary";

// GET /api/environmental/departments/summary
// Optional: ?departmentId=... for a single department, omit for all.
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    if (departmentId) {
      try {
        const summary = await getDepartmentEnvironmentalSummary(departmentId);
        return ok(summary);
      } catch {
        return notFound("Department not found");
      }
    }

    const summaries = await getAllDepartmentEnvironmentalSummaries();
    return ok(summaries);
  });
}