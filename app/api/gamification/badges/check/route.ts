import { NextRequest, NextResponse } from 'next/server';
import { checkAndAwardBadges } from '@/lib/gamification/badge-engine';
import { notifyBadgeAwards } from '@/lib/gamification/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    const results = await checkAndAwardBadges(employeeId);

    const newlyAwarded = results.filter((r) => r.newlyAwarded);
    notifyBadgeAwards(employeeId, results);

    return NextResponse.json({
      checked: results.length,
      newlyAwarded: newlyAwarded.length,
      badges: results,
    });
  } catch (error) {
    console.error('Badge check error:', error);
    return NextResponse.json({ error: 'Failed to check badges' }, { status: 500 });
  }
}
