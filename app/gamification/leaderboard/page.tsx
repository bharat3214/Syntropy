import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import Leaderboard, { type LeaderboardEntry, type QueryMetrics } from '@/components/gamification/Leaderboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Live department and employee sustainability rankings.',
};

function safeNum(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  return v;
}

async function fetchLeaderboardData(): Promise<{
  entries: LeaderboardEntry[];
}> {
  const start = performance.now();
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

  const durationMs = performance.now() - start;

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const partMap = new Map(participationCounts.map((p) => [p.employeeId, p._count._all]));
  const badgeMap = new Map(badgeCounts.map((b) => [b.employeeId, b._count._all]));

  const entries: LeaderboardEntry[] = xpTotals.map((row, idx) => {
    const emp = empMap.get(row.employeeId);
    const fullName = [emp?.firstName, emp?.lastName].filter(Boolean).join(' ') || row.employeeId;
    return {
      rank: idx + 1,
      employeeId: row.employeeId,
      name: fullName,
      department: emp?.department?.name ?? '—',
      xpTotal: safeNum(row._sum.amount),
      challengesCompleted: partMap.get(row.employeeId) ?? 0,
      badgeCount: badgeMap.get(row.employeeId) ?? 0,
    };
  });

  return {
    entries,
  };
}

async function LeaderboardContent() {
  const { entries } = await fetchLeaderboardData();
  return <Leaderboard entries={entries} />;
}

export default function LeaderboardPage() {
  return (
    <>
      <GlobalNav />
      <GamificationSubNav />
      <main
        className="mx-auto max-w-7xl space-y-8 p-6 md:p-8"
        style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      >
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#111815] border border-[#232B27] rounded-xl">
              <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                Syntropy Leaderboard
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Real-time standings based on accumulated ESG gamification points.
              </p>
            </div>
          </div>
        </header>

        <Suspense
          fallback={
            <div
              className="rounded-2xl h-96 animate-pulse"
              style={{ background: '#111815', border: '1px solid #232B27' }}
            />
          }
        >
          <LeaderboardContent />
        </Suspense>
      </main>
    </>
  );
}
