import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const challengeId = searchParams.get('challengeId');

    const rows = await prisma.challengeParticipation.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(challengeId ? { challengeId } : {}),
      },
      include: {
        challenge: { select: { title: true, xpReward: true, status: true } },
        employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch participations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, challengeId, proofUrl } = body;

    if (!employeeId || !challengeId) {
      return NextResponse.json({ error: 'employeeId and challengeId are required' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    if (challenge.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Challenge is not active' }, { status: 409 });
    }

    const participation = await prisma.challengeParticipation.upsert({
      where: { employeeId_challengeId: { employeeId, challengeId } },
      update: { proofUrl, status: 'PENDING' },
      create: { employeeId, challengeId, proofUrl, status: 'PENDING' },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
