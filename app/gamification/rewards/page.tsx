import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import RewardsCatalogue, { type RewardItem } from '@/components/gamification/RewardsCatalogue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rewards',
  description: 'Redeem ESG points for company perks and sustainability rewards.',
};

const DEMO_EMPLOYEE_ID = 'demo-employee-001';

function safeNum(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  return v;
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

async function RewardsContent() {
  let rewards: RewardItem[] = [];
  let userXp = 0;
  try {
    [rewards, userXp] = await Promise.all([
      fetchRewards(),
      fetchUserXp(DEMO_EMPLOYEE_ID),
    ]);
  } catch {
    // If not seeded
  }
  return <RewardsCatalogue rewards={rewards} userXp={userXp} />;
}

export default function RewardsPage() {
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
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                Rewards Catalogue
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Redeem points for real-world incentives.
              </p>
            </div>
          </div>
        </header>

        <Suspense
          fallback={
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl h-44"
                  style={{ background: '#111815', border: '1px solid #232B27' }}
                />
              ))}
            </div>
          }
        >
          <RewardsContent />
        </Suspense>
      </main>
    </>
  );
}
