'use client';

import { useState, useRef } from 'react';
import { Shield, Award, Leaf, Users, Star, Info, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BadgeData {
  id: string;
  name: string;
  iconUrl: string; // may be a path or a keyword for inline SVG
  unlockRule: Record<string, unknown>; // JSON from DB
  awardedAt?: string; // ISO — undefined means locked
}

interface BadgeGalleryProps {
  badges: BadgeData[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline badge icon map  (covers typical badge archetypes from context.md)
// ─────────────────────────────────────────────────────────────────────────────

function BadgeIcon({ name, earned }: { name: string; earned: boolean }) {
  const color = earned ? '#22C55E' : '#4B5563';
  const size = 32;

  const lower = name.toLowerCase();
  if (lower.includes('beginner') || lower.includes('green'))
    return <Leaf size={size} style={{ color }} strokeWidth={1.75} />;
  if (lower.includes('carbon') || lower.includes('saver'))
    return <Shield size={size} style={{ color }} strokeWidth={1.75} />;
  if (lower.includes('champion') || lower.includes('sustainability'))
    return <Award size={size} style={{ color }} strokeWidth={1.75} />;
  if (lower.includes('team') || lower.includes('player'))
    return <Users size={size} style={{ color }} strokeWidth={1.75} />;

  return <Star size={size} style={{ color }} strokeWidth={1.75} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip overlay showing unlock_rule JSON
// ─────────────────────────────────────────────────────────────────────────────

function UnlockRuleTooltip({
  rule,
  visible,
  onClose,
}: {
  rule: Record<string, unknown>;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <div
      role="tooltip"
      className="absolute z-40 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 rounded-xl shadow-2xl"
      style={{ background: '#0B0F0D', border: '1px solid #232B27' }}
    >
      {/* Arrow */}
      <span
        className="absolute left-1/2 -translate-x-1/2 top-full"
        style={{
          display: 'block',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #232B27',
        }}
      />

      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
          Unlock Rule
        </span>
        <button
          onClick={onClose}
          className="transition-opacity hover:opacity-70"
          style={{ color: '#9CA3AF' }}
          aria-label="Close tooltip"
        >
          <X size={12} />
        </button>
      </div>

      <pre
        className="rounded-b-xl p-3 text-xs overflow-auto max-h-40 font-mono leading-relaxed"
        style={{ color: '#4ADE80', background: '#0F1512', borderTop: '1px solid #232B27' }}
      >
        {JSON.stringify(rule, null, 2)}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Badge Card
// ─────────────────────────────────────────────────────────────────────────────

function BadgeCard({ badge }: { badge: BadgeData }) {
  const earned = Boolean(badge.awardedAt);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div
      id={`badge-card-${badge.id}`}
      className={`relative flex flex-col items-center gap-3 bg-[#111815] border rounded-2xl p-5 flex-shrink-0 shadow-lg shadow-black/40 transition-all duration-150 ease-out hover:-translate-y-1 ${earned ? 'border-[#22C55E]/25' : 'border-[#232B27]'}`}
      style={{
        width: '140px',
        minWidth: '140px',
      }}
      aria-label={`Badge: ${badge.name}${earned ? ' (earned)' : ' (locked)'}`}
    >
      {/* Icon circle */}
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full"
        style={{
          background: earned ? 'rgba(34,197,94,0.10)' : 'rgba(75,85,99,0.12)',
          border: `2px solid ${earned ? 'rgba(34,197,94,0.30)' : '#232B27'}`,
        }}
      >
        <BadgeIcon name={badge.name} earned={earned} />
      </div>

      {/* Badge name */}
      <p
        className="text-xs font-semibold text-center leading-tight"
        style={{ color: earned ? '#F3F4F1' : '#9CA3AF' }}
      >
        {badge.name}
      </p>

      {/* Status / date */}
      {earned ? (
        <span
          className="text-xs rounded-full px-2 py-0.5 font-medium"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
          title={`Awarded on ${new Date(badge.awardedAt!).toLocaleDateString()}`}
        >
          Earned
        </span>
      ) : (
        <span
          className="text-xs rounded-full px-2 py-0.5 font-medium"
          style={{ background: '#0F1512', color: '#6B7280', border: '1px solid #232B27' }}
        >
          Locked
        </span>
      )}

      {/* Info / rule trigger */}
      <button
        onClick={() => setTooltipVisible((v) => !v)}
        className="flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
        style={{ color: '#9CA3AF' }}
        aria-expanded={tooltipVisible}
        aria-label={`View unlock rule for ${badge.name}`}
      >
        <Info size={11} />
        Unlock rule
      </button>

      {/* Tooltip */}
      <UnlockRuleTooltip
        rule={badge.unlockRule}
        visible={tooltipVisible}
        onClose={() => setTooltipVisible(false)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge Gallery (exported)
// ─────────────────────────────────────────────────────────────────────────────

export default function BadgeGallery({ badges }: BadgeGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const earned = badges.filter((b) => b.awardedAt);
  const locked = badges.filter((b) => !b.awardedAt);

  return (
    <section id="badge-gallery-section" className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#4ADE80' }}>
            Badge Gallery
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            {earned.length} earned &middot; {locked.length} locked
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: 'rgba(34,197,94,0.10)', color: '#22C55E' }}
        >
          {earned.length}/{badges.length}
        </span>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
        role="list"
        aria-label="Badge collection"
      >
        {badges.map((badge) => (
          <div key={badge.id} role="listitem">
            <BadgeCard badge={badge} />
          </div>
        ))}
      </div>
    </section>
  );
}
