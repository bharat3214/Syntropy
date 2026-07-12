'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Environmental', href: '/environmental' },
  { label: 'Social', href: '/social' },
  { label: 'Governance', href: '/governance' },
  { label: 'Gamification', href: '/gamification' },
  { label: 'Reports', href: '/reports' },
  { label: 'Settings', href: '/settings' },
] as const;

export default function GlobalNav() {
  const pathname = usePathname();

  // Match on segment root — /gamification/challenges → active for "Gamification"
  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{ background: '#111815', borderBottom: '1px solid #232B27' }}
    >
      <nav
        className="mx-auto flex max-w-[1280px] items-center gap-6 px-6 h-14"
        aria-label="Global navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 mr-4"
          aria-label="Syntropy home"
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          >
            <Leaf size={15} style={{ color: '#22C55E' }} />
          </span>
          <span className="font-bold text-sm tracking-tight" style={{ color: '#F3F4F1' }}>
            Syntropy
          </span>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase()}`}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ease-out"
                style={{
                  color: active ? '#22C55E' : '#9CA3AF',
                  background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
                }}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
