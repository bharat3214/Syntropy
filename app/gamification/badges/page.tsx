import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import BadgeGallery, { type BadgeData } from '@/components/gamification/BadgeGallery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Badges',
  description: 'Employee ESG achievements and milestone badges.',
};

const DEMO_EMPLOYEE_ID = 'demo-employee-001';

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

async function BadgesContent() {
  let badges: BadgeData[] = [];
  try {
    badges = await fetchBadges(DEMO_EMPLOYEE_ID);
  } catch {
    // If not seeded
  }
  return <BadgeGallery badges={badges} />;
}

export default function BadgesPage() {
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                Badges
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Earn achievements for your sustainability efforts.
              </p>
            </div>
          </div>
        </header>

        <Suspense
          fallback={
            <div
              className="rounded-2xl h-48 animate-pulse"
              style={{ background: '#111815', border: '1px solid #232B27' }}
            />
          }
        >
          <BadgesContent />
        </Suspense>
      </main>
    </>
  );
}
