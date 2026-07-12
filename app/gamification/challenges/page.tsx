import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import ChallengeGrid, { ChallengeGridSkeleton, type Challenge } from '@/components/gamification/ChallengeGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Challenges',
  description: 'Active departmental and individual ESG challenges.',
};

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
    difficulty: c.xpReward >= 300 ? 'Hard' : c.xpReward >= 150 ? 'Medium' : 'Easy',
  }));
}

async function ChallengesContent() {
  const challenges = await fetchChallenges();
  return <ChallengeGrid challenges={challenges} />;
}

export default function ChallengesPage() {
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                Active Challenges
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Participate in company-wide ESG challenges to earn XP.
              </p>
            </div>
          </div>
        </header>

        <Suspense fallback={<ChallengeGridSkeleton />}>
          <ChallengesContent />
        </Suspense>
      </main>
    </>
  );
}
