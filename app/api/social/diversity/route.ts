import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function resolveDepartmentId(name: string): Promise<string | null> {
  const dept = await prisma.department.findFirst({ where: { name } });
  return dept?.id ?? null;
}

/**
 * GET /api/social/diversity
 * List all diversity metrics. Supports ?departmentId=&department=&category=&year=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const departmentId = searchParams.get("departmentId");
    const department = searchParams.get("department");
    const category = searchParams.get("category");
    const year = searchParams.get("year");

    let actualDepartmentId = departmentId || undefined;
    if (department) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    const where: Record<string, unknown> = {};
    if (actualDepartmentId) where.departmentId = actualDepartmentId;
    if (category) where.category = category;
    if (year) where.year = Number(year);

    const metrics = await prisma.diversityMetric.findMany({
      where,
      orderBy: [{ departmentId: "asc" }, { category: "asc" }, { label: "asc" }],
      include: { department: true },
    });

    const flattened = metrics.map((m) => ({ ...m, department: m.department.name }));

    // Group by departmentId and category for easier frontend consumption
    const grouped: Record<string, Record<string, typeof flattened>> = {};
    for (const metric of flattened) {
      if (!grouped[metric.departmentId]) grouped[metric.departmentId] = {};
      if (!grouped[metric.departmentId][metric.category]) {
        grouped[metric.departmentId][metric.category] = [];
      }
      grouped[metric.departmentId][metric.category].push(metric);
    }

    return NextResponse.json({ metrics: flattened, grouped });
  } catch (error) {
    console.error("GET /api/social/diversity error:", error);
    return NextResponse.json({ error: "Failed to fetch diversity metrics." }, { status: 500 });
  }
}

/**
 * POST /api/social/diversity
 * Create a new diversity metric entry.
 * Accepts `department` (name string) or `departmentId`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { departmentId, department, category, label, value, total, period, year } = body;

    let actualDepartmentId = departmentId;
    if (department && !actualDepartmentId) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    if (!actualDepartmentId || !category || !label || value == null || total == null || !period || year == null) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["departmentId or department", "category", "label", "value", "total", "period", "year"] },
        { status: 400 }
      );
    }

    const validCategories = ["Gender", "Ethnicity", "Age Group", "Disability"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    const metric = await prisma.diversityMetric.create({
      data: {
        departmentId: actualDepartmentId,
        category,
        label,
        value: Number(value),
        total: Number(total),
        period,
        year: Number(year),
      },
      include: { department: true },
    });

    return NextResponse.json({ ...metric, department: metric.department.name }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/diversity error:", error);
    return NextResponse.json({ error: "Failed to create diversity metric." }, { status: 500 });
  }
}
