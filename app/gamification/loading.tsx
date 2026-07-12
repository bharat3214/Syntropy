/**
 * app/gamification/loading.tsx
 *
 * Next.js loading.js convention — wraps the page in a Suspense boundary
 * automatically. Shown immediately on navigation while the async page.tsx
 * server components are being fetched and rendered.
 */

export default function GamificationLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-8 flex flex-col gap-8"
      style={{ background: '#0B0F0D', minHeight: 'calc(100vh - 112px)' }}
      aria-busy="true"
      aria-label="Loading gamification module"
    >
      {/* Page title skeleton */}
      <div className="flex flex-col gap-2">
        <div
          className="h-7 w-48 rounded-lg animate-pulse"
          style={{ background: '#111815' }}
        />
        <div
          className="h-4 w-80 rounded animate-pulse"
          style={{ background: '#111815' }}
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl h-16 animate-pulse"
            style={{ background: '#111815', border: '1px solid #232B27' }}
          />
        ))}
      </div>

      {/* Challenges skeleton */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-52 rounded-md animate-pulse" style={{ background: '#111815' }} />
          <div className="h-9 w-36 rounded-xl animate-pulse" style={{ background: '#111815' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl h-64 animate-pulse"
              style={{ background: '#111815', border: '1px solid #232B27' }}
            />
          ))}
        </div>
      </div>

      {/* Leaderboard skeleton */}
      <div
        className="rounded-2xl overflow-hidden animate-pulse"
        style={{ background: '#111815', border: '1px solid #232B27', height: 400 }}
      />

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div
          className="xl:col-span-3 rounded-2xl h-52 animate-pulse"
          style={{ background: '#111815', border: '1px solid #232B27' }}
        />
        <div
          className="xl:col-span-2 rounded-2xl h-52 animate-pulse"
          style={{ background: '#111815', border: '1px solid #232B27' }}
        />
      </div>
    </div>
  );
}
