import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { pointCost: 'asc' },
    });
    return NextResponse.json(rewards, { status: 200 });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json({ error: 'Failed to retrieve rewards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reward = await prisma.reward.create({
      data: {
        itemName: body.itemName,
        pointCost: body.pointCost,
        stockCount: body.stockCount ?? 100,
      },
    });
    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
