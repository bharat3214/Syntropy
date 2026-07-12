import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        _count: { select: { participations: true } },
      },
      orderBy: { endDate: 'asc' },
    });
    return NextResponse.json(challenges, { status: 200 });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to retrieve challenges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const challenge = await prisma.challenge.create({
      data: {
        title: body.title,
        description: body.description,
        xpReward: body.xpReward,
        status: body.status || 'DRAFT',
        evidenceRequired: body.evidenceRequired ?? false,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(Date.now() + 7 * 86400000),
      },
    });
    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
