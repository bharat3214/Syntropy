import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, created, badRequest, withErrorHandling } from "@/lib/api";
import { emissionFactorCreateSchema } from "@/validators/environmental";

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const factors = await prisma.emissionFactor.findMany({
      where: {
        ...(status ? { status: status as "ACTIVE" | "INACTIVE" } : {}),
        ...(category ? { category } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(factors);
  });
}

// POST /api/environmental/emission-factors
export async function POST(req: NextRequest) {

  return withErrorHandling(async () => {
    const body = await req.json();
    const parsed = emissionFactorCreateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const factor = await prisma.emissionFactor.create({
      data: parsed.data,
    });

    return created(factor);
  });
}