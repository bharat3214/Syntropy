import { Suspense } from 'react';
import { prisma } from '@/lib/db';

import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import Leaderboard, { type LeaderboardEntry } from '@/components/gamification/Leaderboard';
import ChallengeGrid, { ChallengeGridSkeleton, type Challenge } from '@/components/gamification/ChallengeGrid';
import BadgeGallery, { type BadgeData } from '@/components/gamification/BadgeGallery';
import RewardsCatalogue, { type RewardItem } from '@/components/gamification/RewardsCatalogue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gamification',
  description:
    'Employee sustainability challenges, XP leaderboard, badge collection, and rewards catalogue.',
};

// ─────────────────────────────────────────────────────────────────────────────
// BigInt safety — PostgreSQL returns BigInt for XpLedger.id and aggregations.
// Prisma serialises these as JS BigInt which cannot be passed to Client
// Components as props (not JSON-serialisable).  Cast all BigInts to Number here,
// before they leave the Server Component boundary.
// ─────────────────────────────────────────────────────────────────────────────

function safeNum(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  return v;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data fetchers — BATCHED approach (single query with _sum aggregation)
// The leaderboard widget lets users toggle to a simulated N+1 mode for
// educational purposes; the actual DB call is always the batched version.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchLeaderboardData(): Promise<{
  entries: LeaderboardEntry[];
}> {
  const start = performance.now();

  // Batched: one query with GROUP BY via Prisma groupBy + include
  const xpTotals = await prisma.xpLedger.groupBy({
    by: ['employeeId'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 50,
  });

  // Single batched read for all employees referenced above
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

  // Build lookup maps
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

async function fetchChallenges(): Promise<Challenge[]> {
  const rows = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    xpReward: c.xpReward,
    status: c.status as Challenge['status'],
    evidenceRequired: c.evidenceRequired,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    // Difficulty is not stored in schema; derive from xpReward for display
    difficulty:
      c.xpReward >= 300 ? 'Hard' : c.xpReward >= 150 ? 'Medium' : 'Easy',
  }));
}

async function fetchBadges(employeeId: string): Promise<BadgeData[]> {
  const [allBadges, earnedBadges] = await Promise.all([
    prisma.badge.findMany({ orderBy: { name: 'asc' } }),
    prisma.employeeBadge.findMany({
      where: { employeeId },
      select: { badgeId: true, awardedAt: true },
    }),
  ]);

  const earnedMap = new Map(earnedBadges.map((e) => [e.badgeId, e.awardedAt]));

  return allBadges.map((b) => ({
    id: b.id,
    name: b.name,
    iconUrl: b.iconUrl,
    unlockRule: b.unlockRule as Record<string, unknown>,
    awardedAt: earnedMap.get(b.id)?.toISOString(),
  }));
}

async function fetchRewards(): Promise<RewardItem[]> {
  const rows = await prisma.reward.findMany({ orderBy: { pointCost: 'asc' } });
  return rows.map((r) => ({
    id: r.id,
    itemName: r.itemName,
    pointCost: r.pointCost,
    stockCount: r.stockCount,
  }));
}

async function fetchUserXp(employeeId: string): Promise<number> {
  const result = await prisma.xpLedger.aggregate({
    where: { employeeId },
    _sum: { amount: true },
  });
  return safeNum(result._sum.amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton components for Suspense fallbacks
// ─────────────────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: '#111815', border: '1px solid #232B27' }}
      aria-hidden="true"
    >
      <div className="p-5" style={{ borderBottom: '1px solid #232B27' }}>
        <div className="h-5 w-40 rounded-md" style={{ background: '#1A2420' }} />
        <div className="h-3 w-28 rounded mt-2" style={{ background: '#1A2420' }} />
      </div>
      <div className="divide-y" style={{ borderColor: '#232B27' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3">
            <div className="w-8 h-8 rounded-full" style={{ background: '#1A2420' }} />
            <div className="w-9 h-9 rounded-full" style={{ background: '#1A2420' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded" style={{ background: '#1A2420' }} />
              <div className="h-2.5 w-20 rounded" style={{ background: '#1A2420' }} />
            </div>
            <div className="h-4 w-16 rounded" style={{ background: '#1A2420' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeGallerySkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
      <div className="h-4 w-32 rounded" style={{ background: '#1A2420' }} />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-2xl"
            style={{ background: '#111815', border: '1px solid #232B27', width: 140, height: 196 }}
          />
        ))}
      </div>
    </div>
  );
}

function RewardsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
      <div className="h-4 w-40 rounded" style={{ background: '#1A2420' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl h-44"
            style={{ background: '#111815', border: '1px solid #232B27' }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Async sub-sections (each is its own async Server Component for granular
// Suspense streaming — fast data unblocks slow data)
// ─────────────────────────────────────────────────────────────────────────────

async function LeaderboardSection() {
  const { entries } = await fetchLeaderboardData();
  return <Leaderboard entries={entries} />;
}

async function ChallengesSection() {
  const challenges = await fetchChallenges();
  return <ChallengeGrid challenges={challenges} />;
}

// NOTE: employeeId would come from session/auth in production.
// Using a stable placeholder that won't crash if table is empty.
const DEMO_EMPLOYEE_ID = 'demo-employee-001';

async function BadgesSection() {
  let badges: BadgeData[] = [];
  try {
    badges = await fetchBadges(DEMO_EMPLOYEE_ID);
  } catch {
    // DB not seeded — render empty gallery gracefully
  }
  if (badges.length === 0) return null;
  return <BadgeGallery badges={badges} />;
}

async function RewardsSection() {
  let rewards: RewardItem[] = [];
  let userXp = 0;
  try {
    [rewards, userXp] = await Promise.all([
      fetchRewards(),
      fetchUserXp(DEMO_EMPLOYEE_ID),
    ]);
  } catch {
    // DB not seeded
  }
  if (rewards.length === 0) return null;
  return <RewardsCatalogue rewards={rewards} userXp={userXp} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats summary bar
// ─────────────────────────────────────────────────────────────────────────────

async function StatsSummary() {
  let totalChallenges = 0;
  let activeChallenges = 0;
  let totalBadges = 0;
  let totalRewards = 0;

  try {
    [totalChallenges, activeChallenges, totalBadges, totalRewards] = await Promise.all([
      prisma.challenge.count(),
      prisma.challenge.count({ where: { status: 'ACTIVE' } }),
      prisma.badge.count(),
      prisma.reward.count({ where: { stockCount: { gt: 0 } } }),
    ]);
  } catch {
    // Ignore — stats are non-critical
  }

  const stats = [
    { label: 'Total Challenges', value: totalChallenges },
    { label: 'Active Challenges', value: activeChallenges },
    { label: 'Badges Available', value: totalBadges },
    { label: 'Rewards In Stock', value: totalRewards },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              {s.label}
            </p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-[#4ADE80]">
              {s.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────────────────────────────────────

export default function GamificationPage() {
  return (
    <>
      <GlobalNav />
      <GamificationSubNav />

      <main
        id="gamification-main"
        className="mx-auto max-w-7xl space-y-8 p-6 md:p-8"
        style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      >
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#111815] border border-[#232B27] rounded-xl">
              <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                Gamification Dashboard
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Track challenges, earn XP, collect badges, and redeem rewards.
              </p>
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <Suspense
          fallback={
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl h-16" style={{ background: '#111815' }} />
              ))}
            </div>
          }
        >
          <StatsSummary />
        </Suspense>

        {/* Challenges panel */}
        <Suspense fallback={<ChallengeGridSkeleton />}>
          <ChallengesSection />
        </Suspense>

        {/* Leaderboard */}
        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardSection />
        </Suspense>

        {/* Badge gallery + Rewards — two-column on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Badge gallery — narrower */}
          <div className="xl:col-span-3">
            <Suspense fallback={<BadgeGallerySkeleton />}>
              <BadgesSection />
            </Suspense>
          </div>

          {/* Spacer / future panel on xl */}
          <div className="xl:col-span-2">
            <Suspense fallback={<RewardsSkeleton />}>
              <RewardsSection />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
