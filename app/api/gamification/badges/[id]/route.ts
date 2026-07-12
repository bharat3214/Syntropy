import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const badge = await prisma.badge.findUnique({
      where: { id },
      include: { _count: { select: { employeeBadges: true } } },
    });
    if (!badge) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(badge, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve badge' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const badge = await prisma.badge.update({
      where: { id },
      data: {
        name: body.name,
        iconUrl: body.iconUrl,
        unlockRule: body.unlockRule,
      },
    });
    return NextResponse.json(badge, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.badge.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
  }
}
