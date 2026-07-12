import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import RewardsCatalogue, { type RewardItem } from '@/components/gamification/RewardsCatalogue';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rewards – Syntropy',
  description: 'Redeem ESG points for company incentives and rewards.',
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
        className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-8 flex flex-col gap-6"
        style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      >
        <section aria-labelledby="rewards-title">
          <h1 id="rewards-title" className="text-xl font-bold" style={{ color: '#4ADE80' }}>
            Rewards Catalog
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Redeem accumulated XP for items, experiences, and carbon offsets.
          </p>
        </section>

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
