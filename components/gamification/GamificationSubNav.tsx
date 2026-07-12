'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const GAMIFICATION_TABS = [
  { label: 'Overview', href: '/gamification' },
  { label: 'Active Challenges', href: '/gamification/challenges' },
  { label: 'Badges', href: '/gamification/badges' },
  { label: 'Rewards', href: '/gamification/rewards' },
  { label: 'Leaderboard', href: '/gamification/leaderboard' },
] as const;

export default function GamificationSubNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    // Exact match for root, prefix match for sub-routes
    if (href === '/gamification') return pathname === '/gamification';
    return pathname.startsWith(href);
  }

  return (
    <div
      className="w-full"
      style={{ borderBottom: '1px solid #232B27' }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center gap-2 px-6 md:px-8 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
        aria-label="Gamification module navigation"
      >
        {GAMIFICATION_TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              id={`gamification-tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex-shrink-0 relative px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out whitespace-nowrap ${active ? 'text-[#22C55E]' : 'text-[#9CA3AF] hover:text-[#F3F4F1]'}`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#22C55E]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
