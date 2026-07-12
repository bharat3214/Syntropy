import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reward = await prisma.reward.findUnique({ where: { id } });
    if (!reward) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(reward, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve reward' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reward = await prisma.reward.update({
      where: { id },
      data: {
        itemName: body.itemName,
        pointCost: body.pointCost,
        stockCount: body.stockCount,
      },
    });
    return NextResponse.json(reward, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update reward' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.reward.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete reward' }, { status: 500 });
  }
}
