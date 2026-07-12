import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import Leaderboard, { type LeaderboardEntry, type QueryMetrics } from '@/components/gamification/Leaderboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard – Syntropy',
  description: 'Live department and employee sustainability rankings.',
};

function safeNum(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  return v;
}

async function fetchLeaderboardData(): Promise<{
  entries: LeaderboardEntry[];
  metrics: QueryMetrics;
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
    metrics: { mode: 'batched', durationMs, queryCount: 4 },
  };
}

async function LeaderboardContent() {
  const { entries, metrics } = await fetchLeaderboardData();
  return <Leaderboard entries={entries} metrics={metrics} />;
}

export default function LeaderboardPage() {
  return (
    <>
      <GlobalNav />
      <GamificationSubNav />
      <main
        className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-8 flex flex-col gap-6"
        style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      >
        <section aria-labelledby="leaderboard-title">
          <h1 id="leaderboard-title" className="text-xl font-bold" style={{ color: '#4ADE80' }}>
            Ecosphere Leaderboard
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Real-time standings based on accumulated ESG gamification points.
          </p>
        </section>

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
