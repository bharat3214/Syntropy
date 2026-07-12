import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function fetchLeaderboardData() {
  const xpTotals = await prisma.xpLedger.groupBy({
    by: ['employeeId'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 50,
  });

  const employeeIds = xpTotals.map((x) => x.employeeId);

  const [employees, participationCounts, badgeCounts] = await Promise.all([
    prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
      },
    }),
    prisma.challengeParticipation.groupBy({
      by: ['employeeId'],
      where: { employeeId: { in: employeeIds }, status: 'APPROVED' },
      _count: { _all: true },
    }),
    prisma.employeeBadge.groupBy({
      by: ['employeeId'],
      where: { employeeId: { in: employeeIds } },
      _count: { _all: true },
    }),
  ]);

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const partMap = new Map(participationCounts.map((p) => [p.employeeId, p._count._all]));
  const badgeMap = new Map(badgeCounts.map((b) => [b.employeeId, b._count._all]));

  return xpTotals.map((row, idx) => {
    const emp = empMap.get(row.employeeId);
    return {
      rank: idx + 1,
      employeeId: row.employeeId,
      name: [emp?.firstName, emp?.lastName].filter(Boolean).join(' ') || row.employeeId,
      department: emp?.department?.name ?? '\u2014',
      xpTotal: Number(row._sum.amount ?? 0),
      challengesCompleted: partMap.get(row.employeeId) ?? 0,
      badgeCount: badgeMap.get(row.employeeId) ?? 0,
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    const entries = await fetchLeaderboardData();

    if (format === 'csv') {
      const headers = ['Rank', 'Employee ID', 'Name', 'Department', 'XP Total', 'Challenges Completed', 'Badges'];
      const rows = entries.map((e) =>
        [e.rank, e.employeeId, e.name, e.department, e.xpTotal, e.challengesCompleted, e.badgeCount]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      );
      const csv = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="syntropy-leaderboard.csv"',
        },
      });
    }

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to compute leaderboard' }, { status: 500 });
  }
}
