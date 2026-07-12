import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import BadgeGallery, { type BadgeData } from '@/components/gamification/BadgeGallery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Badges – Syntropy',
  description: 'Earned ESG badges and achievement rule configurations.',
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
        className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-8 flex flex-col gap-6"
        style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      >
        <section aria-labelledby="badges-title">
          <h1 id="badges-title" className="text-xl font-bold" style={{ color: '#4ADE80' }}>
            Badge Gallery
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Earn achievements by completing sustainability challenges and contributing to ESG targets.
          </p>
        </section>

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
