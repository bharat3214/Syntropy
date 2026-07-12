'use client';

import { useState } from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2, Package } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RewardItem {
  id: string;
  itemName: string;
  pointCost: number;
  stockCount: number;
  description?: string;
}

interface RewardsCatalogueProps {
  rewards: RewardItem[];
  userXp: number; // current employee's XP balance
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual reward card
// ─────────────────────────────────────────────────────────────────────────────

function RewardCard({ reward, userXp }: { reward: RewardItem; userXp: number }) {
  const [redeemed, setRedeemed] = useState(false);
  const canAfford = userXp >= reward.pointCost;
  const inStock = reward.stockCount > 0;
  const canRedeem = canAfford && inStock && !redeemed;

  const stockStatus =
    reward.stockCount === 0
      ? 'Out of stock'
      : reward.stockCount <= 5
      ? `${reward.stockCount} left`
      : `${reward.stockCount} in stock`;

  const stockColor =
    reward.stockCount === 0
      ? '#EF4444'
      : reward.stockCount <= 5
      ? '#F59E0B'
      : '#22C55E';

  return (
    <article
      id={`reward-card-${reward.id}`}
      className="flex flex-col gap-3 rounded-2xl p-5 transition-all duration-150 ease-out hover:-translate-y-1"
      style={{
        background: '#111815',
        border: `1px solid ${redeemed ? 'rgba(34,197,94,0.3)' : '#232B27'}`,
        opacity: !inStock ? 0.7 : 1,
      }}
      aria-label={`Reward: ${reward.itemName}`}
    >
      {/* Icon row */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.10)' }}
        >
          <ShoppingBag size={18} style={{ color: '#F59E0B' }} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: '#F3F4F1' }}>
            {reward.itemName}
          </h3>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: stockColor }}>
            <Package size={11} aria-hidden="true" />
            {stockStatus}
          </p>
        </div>
      </div>

      {/* Description */}
      {reward.description && (
        <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
          {reward.description}
        </p>
      )}

      {/* Cost */}
      <div className="flex items-center justify-between">
        <span
          className="text-base font-bold"
          style={{ color: canAfford ? '#F59E0B' : '#EF4444' }}
          aria-label={`${reward.pointCost} XP required`}
        >
          {reward.pointCost.toLocaleString()} XP
        </span>
        {!canAfford && !redeemed && (
          <span
            className="flex items-center gap-1 text-xs font-medium rounded-lg px-2 py-1"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
            role="alert"
          >
            <AlertTriangle size={11} />
            Insufficient XP
          </span>
        )}
      </div>

      {/* Redeem button */}
      {redeemed ? (
        <div
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5"
          style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
          <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
            Redeemed
          </span>
        </div>
      ) : (
        <button
          id={`redeem-btn-${reward.id}`}
          onClick={() => canRedeem && setRedeemed(true)}
          disabled={!canRedeem}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ease-out"
          style={{
            background: canRedeem ? 'rgba(245,158,11,0.15)' : '#0F1512',
            color: canRedeem ? '#F59E0B' : '#6B7280',
            border: canRedeem ? '1px solid rgba(245,158,11,0.35)' : '1px solid #232B27',
            cursor: canRedeem ? 'pointer' : 'not-allowed',
          }}
          aria-label={`Redeem ${reward.itemName} for ${reward.pointCost} XP`}
          aria-disabled={!canRedeem}
        >
          <ShoppingBag size={14} />
          {!inStock ? 'Out of Stock' : !canAfford ? 'Not Enough XP' : 'Redeem'}
        </button>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rewards Catalogue
// ─────────────────────────────────────────────────────────────────────────────

export default function RewardsCatalogue({ rewards, userXp }: RewardsCatalogueProps) {
  return (
    <section id="rewards-section" className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold" style={{ color: '#4ADE80' }}>
            Rewards Catalogue
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            {rewards.filter((r) => r.stockCount > 0).length} items available
          </p>
        </div>
        {/* User balance badge */}
        <span
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold"
          style={{
            background: 'rgba(245,158,11,0.12)',
            color: '#F59E0B',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
          aria-label={`Your XP balance: ${userXp}`}
        >
          Your balance: {userXp.toLocaleString()} XP
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} userXp={userXp} />
        ))}
      </div>
    </section>
  );
}
