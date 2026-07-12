import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/social/diversity
 * List all diversity metrics. Supports ?departmentId=&category=&year=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const departmentId = searchParams.get("departmentId");
    const category = searchParams.get("category");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = departmentId;
    if (category) where.category = category;
    if (year) where.year = Number(year);

    const metrics = await prisma.diversityMetric.findMany({
      where,
      orderBy: [{ departmentId: "asc" }, { category: "asc" }, { label: "asc" }],
    });

    // Group by departmentId and category for easier frontend consumption
    const grouped: Record<string, Record<string, typeof metrics>> = {};
    for (const metric of metrics) {
      if (!grouped[metric.departmentId]) grouped[metric.departmentId] = {};
      if (!grouped[metric.departmentId][metric.category]) {
        grouped[metric.departmentId][metric.category] = [];
      }
      grouped[metric.departmentId][metric.category].push(metric);
    }

    return NextResponse.json({ metrics, grouped });
  } catch (error) {
    console.error("GET /api/social/diversity error:", error);
    return NextResponse.json({ error: "Failed to fetch diversity metrics." }, { status: 500 });
  }
}

/**
 * POST /api/social/diversity
 * Create a new diversity metric entry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { departmentId, category, label, value, total, period, year } = body;

    if (!departmentId || !category || !label || value == null || total == null || !period || year == null) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["departmentId", "category", "label", "value", "total", "period", "year"] },
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
        departmentId,
        category,
        label,
        value: Number(value),
        total: Number(total),
        period,
        year: Number(year),
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/diversity error:", error);
    return NextResponse.json({ error: "Failed to create diversity metric." }, { status: 500 });
  }
}
