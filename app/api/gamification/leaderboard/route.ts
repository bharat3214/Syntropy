import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try{
        const leaderboardData = await prisma.xpLedger.groupBy({
            by: ['employeeId'],
            _sum: {
              amount: true,
            },
            orderBy: {
              _sum: {
                amount: 'desc',
              },
            },
        });
        //prevent BigInt native serialization crashes
        const formattedLeaderboard = leaderboardData.map((item) => ({
          employeeId: item.employeeId,
          totalXp: item._sum.amount || 0,
        }));
    } catch (error) {
        console.error('Leaderboard calculation error:', error);
        return NextResponse.json(
          { error: 'Failed to compute live leaderboard rankings' },
          { status: 500 }
        );
    }
}