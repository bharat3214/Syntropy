import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        _count: { select: { employeeBadges: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to retrieve badges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const badge = await prisma.badge.create({
      data: {
        name: body.name,
        iconUrl: body.iconUrl || '/badges/default.png',
        unlockRule: body.unlockRule || {},
      },
    });
    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
  }
}
