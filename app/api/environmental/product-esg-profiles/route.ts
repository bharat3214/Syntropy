import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, created, badRequest, withErrorHandling } from "@/lib/api";
import { productESGProfileCreateSchema } from "@/validators/environmental";

// GET /api/environmental/product-esg-profiles
// Optional query params: ?status=ACTIVE&category=Electronics&search=widget
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const profiles = await prisma.productESGProfile.findMany({
      where: {
        ...(status ? { status: status as "ACTIVE" | "INACTIVE" } : {}),
        ...(category ? { category } : {}),
        ...(search
          ? { productName: { contains: search, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(profiles);
  });
}

// POST /api/environmental/product-esg-profiles
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = await req.json();
    const parsed = productESGProfileCreateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const profile = await prisma.productESGProfile.create({
      data: parsed.data,
    });

    return created(profile);
  });
}