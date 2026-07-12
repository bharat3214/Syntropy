import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, badRequest, notFound, withErrorHandling } from "@/lib/api";
import { productESGProfileUpdateSchema } from "@/validators/environmental";

type Params = { params: Promise<{ id: string }> };

// GET /api/environmental/product-esg-profiles/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const profile = await prisma.productESGProfile.findUnique({ where: { id } });
    if (!profile) return notFound("Product ESG profile not found");

    return ok(profile);
  });
}

// PATCH /api/environmental/product-esg-profiles/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await req.json();
    const parsed = productESGProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const existing = await prisma.productESGProfile.findUnique({ where: { id } });
    if (!existing) return notFound("Product ESG profile not found");

    const updated = await prisma.productESGProfile.update({
      where: { id },
      data: parsed.data,
    });

    return ok(updated);
  });
}

// DELETE /api/environmental/product-esg-profiles/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.productESGProfile.findUnique({ where: { id } });
    if (!existing) return notFound("Product ESG profile not found");

    await prisma.productESGProfile.delete({ where: { id } });

    return ok({ id, deleted: true });
  });
}