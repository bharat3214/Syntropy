'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const GAMIFICATION_TABS = [
  { label: 'Challenges', href: '/gamification' },
  { label: 'Challenge Participation', href: '/gamification/challenges' },
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
        className="mx-auto flex max-w-[1280px] items-center gap-1 px-6 overflow-x-auto"
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
              className="flex-shrink-0 relative px-4 py-3 text-sm font-medium transition-all duration-150 ease-out whitespace-nowrap"
              style={{ color: active ? '#F59E0B' : '#9CA3AF' }}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: '#F59E0B' }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
