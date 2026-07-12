import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import GlobalNav from '@/components/GlobalNav';
import GamificationSubNav from '@/components/gamification/GamificationSubNav';
import ChallengeGrid, { ChallengeGridSkeleton, type Challenge } from '@/components/gamification/ChallengeGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Challenges – Syntropy',
  description: 'Active sustainability challenges and participation status.',
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
        className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-8 flex flex-col gap-6"
        style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      >
        <section aria-labelledby="challenges-title">
          <h1 id="challenges-title" className="text-xl font-bold" style={{ color: '#4ADE80' }}>
            Challenge Participation
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Browse ongoing sustainability sprints, track completion, and upload evidence.
          </p>
        </section>

        <Suspense fallback={<ChallengeGridSkeleton />}>
          <ChallengesContent />
        </Suspense>
      </main>
    </>
  );
}
