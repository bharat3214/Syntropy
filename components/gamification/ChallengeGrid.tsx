'use client';

import { useState, useRef } from 'react';
import {
  Flame,
  Clock,
  Upload,
  CheckCircle2,
  Plus,
  XCircle,
  AlertCircle,
  Star,
  CalendarDays,
  PaperclipIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChallengeStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'UPCOMING'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  status: ChallengeStatus;
  evidenceRequired: boolean;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category?: string;
}

interface ChallengeGridProps {
  challenges: Challenge[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
}

function difficultyColor(d: Challenge['difficulty']): string {
  if (d === 'Easy') return '#22C55E';
  if (d === 'Medium') return '#F59E0B';
  return '#EF4444';
}

// ─────────────────────────────────────────────────────────────────────────────
// Status pill
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ChallengeStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', label: 'Draft' },
  ACTIVE: { bg: 'rgba(34,197,94,0.12)', text: '#22C55E', label: 'Active' },
  UPCOMING: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: 'Upcoming' },
  UNDER_REVIEW: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: 'Under Review' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', label: 'Completed' },
  ARCHIVED: { bg: 'rgba(107,114,128,0.12)', text: '#6B7280', label: 'Archived' },
};

function StatusPill({ status }: { status: ChallengeStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {status === 'ACTIVE' && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#22C55E', boxShadow: '0 0 5px #22C55E' }}
        />
      )}
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag-and-drop evidence uploader
// ─────────────────────────────────────────────────────────────────────────────

function EvidenceUploader({ challengeId }: { challengeId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  return (
    <div
      id={`evidence-uploader-${challengeId}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label="Upload evidence file"
      className="rounded-xl flex flex-col items-center justify-center gap-2 py-5 px-3 cursor-pointer transition-all duration-150 ease-out"
      style={{
        background: dragging ? 'rgba(34,197,94,0.08)' : '#0F1512',
        border: `2px dashed ${dragging ? '#22C55E' : '#232B27'}`,
        minHeight: '96px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={handleChange}
        accept=".pdf,.jpg,.jpeg,.png,.mp4"
        aria-hidden="true"
      />
      {file ? (
        <>
          <PaperclipIcon size={16} style={{ color: '#22C55E' }} />
          <p className="text-xs font-medium text-center" style={{ color: '#F3F4F1' }}>
            {file.name}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ color: '#EF4444' }}
            aria-label="Remove file"
          >
            <XCircle size={12} /> Remove
          </button>
        </>
      ) : (
        <>
          <Upload size={18} style={{ color: dragging ? '#22C55E' : '#9CA3AF' }} />
          <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            Drag & drop or <span style={{ color: '#22C55E' }}>browse</span>
          </p>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            PDF, image, or video
          </p>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-join button (no evidence needed)
// ─────────────────────────────────────────────────────────────────────────────

function JoinButton({ challengeId, status }: { challengeId: string; status: ChallengeStatus }) {
  const [joined, setJoined] = useState(false);

  const disabled = status !== 'ACTIVE';

  if (joined) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 justify-center"
        style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
        <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
          Joined
        </span>
      </div>
    );
  }

  return (
    <button
      id={`join-challenge-${challengeId}`}
      onClick={() => !disabled && setJoined(true)}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ease-out"
      style={{
        background: disabled ? '#0F1512' : '#22C55E',
        color: disabled ? '#6B7280' : '#0B0F0D',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: disabled ? '1px solid #232B27' : 'none',
        opacity: disabled ? 0.6 : 1,
      }}
      aria-label={`Join challenge ${challengeId}`}
    >
      <Plus size={14} />
      Join Challenge
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Challenge Card
// ─────────────────────────────────────────────────────────────────────────────

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isActive = challenge.status === 'ACTIVE';
  const dColor = difficultyColor(challenge.difficulty);

  return (
    <article
      id={`challenge-card-${challenge.id}`}
      className={`flex flex-col gap-4 bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 transition-all duration-150 ease-out hover:-translate-y-1 ${isActive ? 'ring-1 ring-[#22C55E]/20' : ''}`}
      aria-label={`Challenge: ${challenge.title}`}
    >
      {/* Card header */}
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug" style={{ color: '#4ADE80' }}>
          {challenge.title}
        </h3>
        <StatusPill status={challenge.status} />
      </header>

      {/* Description */}
      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#9CA3AF' }}>
        {challenge.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {/* Difficulty */}
        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: dColor }}>
          <Flame size={12} aria-hidden="true" />
          {challenge.difficulty}
        </span>

        {/* Deadline */}
        <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
          <CalendarDays size={12} aria-hidden="true" />
          {formatDate(challenge.startDate)} – {formatDate(challenge.endDate)}
        </span>

        {/* Evidence requirement indicator */}
        {challenge.evidenceRequired && (
          <span className="flex items-center gap-1 text-xs" style={{ color: '#F59E0B' }}>
            <AlertCircle size={12} aria-hidden="true" />
            Evidence required
          </span>
        )}
      </div>

      {/* XP reward badge */}
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold"
          style={{
            background: 'rgba(245,158,11,0.12)',
            color: '#F59E0B',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
          aria-label={`${challenge.xpReward} XP reward`}
        >
          <Star size={13} aria-hidden="true" />
          {challenge.xpReward.toLocaleString()} XP
        </span>

        {challenge.evidenceRequired ? null : (
          // Don't double-render uploader in footer row
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            <Clock size={12} className="inline mr-1" aria-hidden="true" />
            Instant completion
          </span>
        )}
      </div>

      {/* Action zone — conditional on evidenceRequired */}
      {challenge.evidenceRequired ? (
        <EvidenceUploader challengeId={challenge.id} />
      ) : (
        <JoinButton challengeId={challenge.id} status={challenge.status} />
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader for a single card
// ─────────────────────────────────────────────────────────────────────────────

function ChallengeCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl p-5 animate-pulse"
      style={{ background: '#111815', border: '1px solid #232B27' }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-2/3 rounded-md" style={{ background: '#1A2420' }} />
        <div className="h-5 w-16 rounded-full" style={{ background: '#1A2420' }} />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded" style={{ background: '#1A2420' }} />
        <div className="h-3 w-4/5 rounded" style={{ background: '#1A2420' }} />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-16 rounded" style={{ background: '#1A2420' }} />
        <div className="h-3 w-28 rounded" style={{ background: '#1A2420' }} />
      </div>
      <div className="h-8 w-28 rounded-xl" style={{ background: '#1A2420' }} />
      <div className="h-10 w-full rounded-xl" style={{ background: '#1A2420' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status filter tabs
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: ChallengeStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Challenge Grid (main export)
// ─────────────────────────────────────────────────────────────────────────────

export default function ChallengeGrid({ challenges }: ChallengeGridProps) {
  const [activeFilter, setActiveFilter] = useState<ChallengeStatus | 'ALL'>('ALL');
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);

  const filtered =
    activeFilter === 'ALL'
      ? challenges
      : challenges.filter((c) => c.status === activeFilter);

  function countForStatus(s: ChallengeStatus | 'ALL') {
    return s === 'ALL' ? challenges.length : challenges.filter((c) => c.status === s).length;
  }

  return (
    <section id="challenges-section" className="flex flex-col gap-5">
      {/* Panel header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#4ADE80' }}>
            Sustainability Challenges
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {challenges.length} total &middot; {challenges.filter((c) => c.status === 'ACTIVE').length} active
          </p>
        </div>

        <button
          id="new-challenge-btn"
          onClick={() => setShowNewChallengeModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ease-out hover:-translate-y-px active:translate-y-0"
          style={{
            background: '#22C55E',
            color: '#0B0F0D',
          }}
          aria-label="Create new challenge"
        >
          <Plus size={16} />
          New Challenge
        </button>
      </header>

      {/* Status filter strip */}
      <nav
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter challenges by status"
      >
        {STATUS_FILTERS.map((f) => {
          const count = countForStatus(f.value);
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              id={`challenge-filter-${f.value}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
                isActive
                  ? 'bg-[#111815] border border-[#22C55E] text-[#22C55E] shadow-sm shadow-[#22C55E]/10'
                  : 'bg-transparent border border-[#232B27] text-[#9CA3AF] hover:text-[#F3F4F1] hover:border-[#9CA3AF]/30'
              }`}
            >
              {f.label}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-xs leading-none"
                  style={{
                    background: isActive ? 'rgba(34,197,94,0.2)' : '#0F1512',
                    color: isActive ? '#22C55E' : '#6B7280',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20"
          style={{ background: '#111815', border: '1px solid #232B27' }}
          role="status"
        >
          <AlertCircle size={28} style={{ color: '#9CA3AF' }} />
          <p className="text-sm font-medium" style={{ color: '#F3F4F1' }}>
            No challenges found
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Try a different filter or create a new challenge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}

      {/* Minimal modal stub — a real implementation would use a portal */}
      {showNewChallengeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-challenge-modal-title"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: '#111815', border: '1px solid #232B27' }}
          >
            <div className="flex items-center justify-between">
              <h3 id="new-challenge-modal-title" className="text-base font-semibold" style={{ color: '#4ADE80' }}>
                New Challenge
              </h3>
              <button
                onClick={() => setShowNewChallengeModal(false)}
                className="transition-opacity hover:opacity-70"
                style={{ color: '#9CA3AF' }}
                aria-label="Close dialog"
              >
                <XCircle size={20} />
              </button>
            </div>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              Challenge creation form goes here. Connect to a server action to persist to the database.
            </p>
            <button
              onClick={() => setShowNewChallengeModal(false)}
              className="self-end rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: '#22C55E', color: '#0B0F0D' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton for the full grid (used by Suspense fallback)
// ─────────────────────────────────────────────────────────────────────────────

export function ChallengeGridSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-48 rounded-md animate-pulse" style={{ background: '#1A2420' }} />
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: '#1A2420' }} />
        </div>
        <div className="h-9 w-36 rounded-xl animate-pulse" style={{ background: '#1A2420' }} />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-20 rounded-xl animate-pulse" style={{ background: '#1A2420' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ChallengeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
