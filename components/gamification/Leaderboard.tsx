'use client';

import { useState } from 'react';
import {
  Trophy,
  Search,
  ChevronUp,
  ChevronDown,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Download,
  Users,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  name: string;
  department: string;
  xpTotal: number;
  challengesCompleted: number;
  badgeCount: number;
}

export interface QueryMetrics {
  mode: 'n1' | 'batched';
  durationMs: number;
  queryCount: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  metrics: QueryMetrics;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rank Badge
// ─────────────────────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        aria-label="1st place"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#0B0F0D',
          boxShadow: '0 0 12px rgba(255,215,0,0.45)',
        }}
      >
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        aria-label="2nd place"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
          color: '#0B0F0D',
          boxShadow: '0 0 10px rgba(192,192,192,0.35)',
        }}
      >
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        aria-label="3rd place"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
          color: '#0B0F0D',
          boxShadow: '0 0 10px rgba(205,127,50,0.35)',
        }}
      >
        3
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium"
      style={{ color: '#9CA3AF' }}
    >
      {rank}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar Initials
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ name, rank }: { name: string; rank: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const ringColor =
    rank === 1
      ? '2px solid #FFD700'
      : rank === 2
      ? '2px solid #C0C0C0'
      : rank === 3
      ? '2px solid #CD7F32'
      : '2px solid #232B27';

  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-semibold flex-shrink-0"
      style={{
        background: '#0F1512',
        color: '#4ADE80',
        border: ringColor,
        letterSpacing: '0.05em',
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Metrics Widget
// ─────────────────────────────────────────────────────────────────────────────

function QueryMetricsWidget({
  metrics,
  mode,
  onToggle,
}: {
  metrics: QueryMetrics;
  mode: 'n1' | 'batched';
  onToggle: () => void;
}) {
  const isN1 = mode === 'n1';

  return (
    <div
      className="flex flex-col gap-3 rounded-xl p-4"
      style={{ background: '#0F1512', border: '1px solid #232B27' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap
            size={14}
            style={{ color: isN1 ? '#EF4444' : '#22C55E' }}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
            Query Mode
          </span>
        </div>
        {/* Toggle */}
        <button
          id="query-mode-toggle"
          onClick={onToggle}
          className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 ease-out focus:outline-none"
          style={{
            background: isN1 ? '#EF444420' : '#22C55E30',
            border: `1px solid ${isN1 ? '#EF4444' : '#22C55E'}`,
          }}
          aria-label="Toggle query mode"
          role="switch"
          aria-checked={!isN1}
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full transition-transform duration-150 ease-out"
            style={{
              background: isN1 ? '#EF4444' : '#22C55E',
              transform: isN1 ? 'translateX(2px)' : 'translateX(18px)',
            }}
          />
        </button>
      </div>

      {/* Status label */}
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{
          background: isN1 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
          border: `1px solid ${isN1 ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
        }}
      >
        {isN1 ? (
          <AlertTriangle size={13} style={{ color: '#EF4444' }} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={13} style={{ color: '#22C55E' }} aria-hidden="true" />
        )}
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: isN1 ? '#EF4444' : '#22C55E' }}
        >
          {isN1 ? 'UNOPTIMIZED N+1 QUERY' : 'BATCHED & INDEXED READ'}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2" style={{ background: '#111815' }}>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Duration</p>
          <p className="text-sm font-bold" style={{ color: '#F3F4F1' }}>
            {metrics.durationMs.toFixed(1)}
            <span className="text-xs font-normal ml-1" style={{ color: '#9CA3AF' }}>ms</span>
          </p>
        </div>
        <div className="rounded-lg p-2" style={{ background: '#111815' }}>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Queries</p>
          <p className="text-sm font-bold" style={{ color: '#F3F4F1' }}>
            {metrics.queryCount}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Table
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = 'rank' | 'xpTotal' | 'challengesCompleted' | 'badgeCount';
type SortDir = 'asc' | 'desc';

export default function Leaderboard({ entries, metrics }: LeaderboardProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [queryMode, setQueryMode] = useState<'n1' | 'batched'>(metrics.mode);
  const [deptFilter, setDeptFilter] = useState('ALL');

  const departments = ['ALL', ...Array.from(new Set(entries.map((e) => e.department))).sort()];

  const simulatedMetrics: QueryMetrics = {
    mode: queryMode,
    durationMs: queryMode === 'n1' ? metrics.durationMs * 8.4 : metrics.durationMs,
    queryCount: queryMode === 'n1' ? entries.length + 1 : 2,
  };

  const filtered = entries
    .filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
      const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === 'rank') diff = a.rank - b.rank;
      else if (sortKey === 'xpTotal') diff = a.xpTotal - b.xpTotal;
      else if (sortKey === 'challengesCompleted') diff = a.challengesCompleted - b.challengesCompleted;
      else if (sortKey === 'badgeCount') diff = a.badgeCount - b.badgeCount;
      return sortDir === 'asc' ? diff : -diff;
    });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={12} style={{ color: '#232B27' }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: '#22C55E' }} />
      : <ChevronDown size={12} style={{ color: '#22C55E' }} />;
  }

  return (
    <section
      id="leaderboard-section"
      className="rounded-2xl overflow-hidden"
      style={{ background: '#111815', border: '1px solid #232B27' }}
    >
      {/* Header bar */}
      <div
        className="flex flex-col gap-3 px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid #232B27' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ background: 'rgba(34,197,94,0.12)' }}
            >
              <Trophy size={16} style={{ color: '#22C55E' }} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold leading-none" style={{ color: '#4ADE80' }}>
                Live Leaderboard
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                {entries.length} participants
              </p>
            </div>
          </div>
          <button
            id="leaderboard-export-btn"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-out hover:-translate-y-px"
            style={{
              background: '#0F1512',
              border: '1px solid #232B27',
              color: '#9CA3AF',
            }}
            aria-label="Export leaderboard as CSV"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#9CA3AF' }}
            />
            <input
              id="leaderboard-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none transition-all duration-150"
              style={{
                background: '#0F1512',
                border: '1px solid #232B27',
                color: '#F3F4F1',
              }}
              aria-label="Search leaderboard"
            />
          </div>

          {/* Dept filter */}
          <div className="relative">
            <Users
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#9CA3AF' }}
            />
            <select
              id="leaderboard-dept-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="appearance-none rounded-lg pl-7 pr-6 py-1.5 text-xs outline-none transition-all duration-150 cursor-pointer"
              style={{
                background: '#0F1512',
                border: '1px solid #232B27',
                color: '#F3F4F1',
              }}
              aria-label="Filter by department"
            >
              {departments.map((d) => (
                <option key={d} value={d} style={{ background: '#111815' }}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #232B27' }}>
                {[
                  { key: 'rank' as SortKey, label: 'Rank', align: 'text-center' },
                  { key: null, label: 'Employee', align: 'text-left' },
                  { key: null, label: 'Department', align: 'text-left' },
                  { key: 'xpTotal' as SortKey, label: 'XP Total', align: 'text-right' },
                  { key: 'challengesCompleted' as SortKey, label: 'Challenges', align: 'text-right' },
                  { key: 'badgeCount' as SortKey, label: 'Badges', align: 'text-right' },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${col.align} ${col.key ? 'cursor-pointer select-none' : ''}`}
                    style={{ color: '#9CA3AF' }}
                    onClick={col.key ? () => handleSort(col.key!) : undefined}
                    aria-sort={
                      col.key && sortKey === col.key
                        ? sortDir === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: '#9CA3AF' }}
                  >
                    No results match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.employeeId}
                    className="group transition-colors duration-150 ease-out"
                    style={{ borderBottom: '1px solid #232B27' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#0F1512')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'transparent')
                    }
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 text-center">
                      <RankBadge rank={entry.rank} />
                    </td>

                    {/* Employee */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={entry.name} rank={entry.rank} />
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#F3F4F1' }}>
                            {entry.name}
                          </p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>
                            {entry.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
                        style={{
                          background: 'rgba(34,197,94,0.08)',
                          color: '#22C55E',
                          border: '1px solid rgba(34,197,94,0.18)',
                        }}
                      >
                        {entry.department}
                      </span>
                    </td>

                    {/* XP */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold" style={{ color: '#F59E0B' }}>
                        {entry.xpTotal.toLocaleString()}
                      </span>
                      <span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>
                        xp
                      </span>
                    </td>

                    {/* Challenges */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium" style={{ color: '#F3F4F1' }}>
                        {entry.challengesCompleted}
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium" style={{ color: '#F3F4F1' }}>
                        {entry.badgeCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sidebar metrics widget */}
        <div
          className="w-full lg:w-52 flex-shrink-0 p-4"
          style={{ borderLeft: '1px solid #232B27', borderTop: '1px solid #232B27' }}
        >
          <QueryMetricsWidget
            metrics={simulatedMetrics}
            mode={queryMode}
            onToggle={() => setQueryMode((m) => (m === 'n1' ? 'batched' : 'n1'))}
          />
        </div>
      </div>

      {/* Footer count */}
      <div
        className="px-5 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid #232B27' }}
      >
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          Showing <span style={{ color: '#F3F4F1' }}>{filtered.length}</span> of{' '}
          <span style={{ color: '#F3F4F1' }}>{entries.length}</span> employees
        </p>
      </div>
    </section>
  );
}
