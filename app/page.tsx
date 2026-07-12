'use client';

/**
 * Syntropy — Marketing Landing Page
 * Implements DESIGN_SPEC.md: dark-mode-only, #22C55E green accent, Geist type.
 *
 * Drop this in as app/page.tsx. Module routes referenced below already exist
 * in this project: /dashboard /environmental /social /governance
 * /gamification /reports /settings
 *
 * Note: this is a Client Component (needed for scroll/reveal/accordion state),
 * so `metadata` should be exported from app/layout.tsx instead of this file.
 */

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react';

/* ============================================================================
   TOKENS — mirrors DESIGN_SPEC.md color system exactly
============================================================================ */

const tokens = {
  '--bg': '#0B0F0D',
  '--card': '#111815',
  '--hover': '#0F1512',
  '--green': '#22C55E',
  '--heading': '#4ADE80',
  '--text': '#F3F4F1',
  '--muted': '#9CA3AF',
  '--border': '#232B27',
  '--warning': '#F59E0B',
  '--error': '#EF4444',
  '--info': '#3B82F6',
} as React.CSSProperties;

/* ============================================================================
   ICONS — hand-drawn inline SVG, Lucide-style: outline, 2px stroke, round joins
============================================================================ */

type IconProps = SVGProps<SVGSVGElement>;

const Icon = ({ children, className = 'w-5 h-5', ...rest }: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {children}
  </svg>
);

const LeafIcon = (p: IconProps) => <Icon {...p}><path d="M11 20A7 7 0 0 1 4 13c0-4 4-9 9-9 3 0 5 2 5 5 0 6-4 11-7 11Z" /><path d="M4 13c3 0 7-1 9-4" /></Icon>;
const UsersIcon = (p: IconProps) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
const ShieldIcon = (p: IconProps) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></Icon>;
const TrophyIcon = (p: IconProps) => <Icon {...p}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M17 5h3a3 3 0 0 1-3 5" /><path d="M7 5H4a3 3 0 0 0 3 5" /></Icon>;
const FileIcon = (p: IconProps) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></Icon>;
const ChartIcon = (p: IconProps) => <Icon {...p}><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></Icon>;
const SparkIcon = (p: IconProps) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></Icon>;
const GaugeIcon = (p: IconProps) => <Icon {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M12 3a9 9 0 0 0-8 13" /><path d="M12 3a9 9 0 0 1 8 13" /><path d="M13.5 10.5 17 7" /></Icon>;
const AlertIcon = (p: IconProps) => <Icon {...p}><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.86 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z" /></Icon>;
const LockIcon = (p: IconProps) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
const KeyIcon = (p: IconProps) => <Icon {...p}><circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6" /><path d="M15.5 7.5 18 10" /><path d="M12.5 10.5 15 13" /></Icon>;
const DbIcon = (p: IconProps) => <Icon {...p}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></Icon>;
const PlugIcon = (p: IconProps) => <Icon {...p}><path d="M12 22v-5" /><path d="M9 8V2M15 8V2" /><path d="M7 8h10v3a5 5 0 0 1-10 0V8Z" /></Icon>;
const CodeIcon = (p: IconProps) => <Icon {...p}><path d="m8 16-4-4 4-4" /><path d="m16 8 4 4-4 4" /></Icon>;
const WebhookIcon = (p: IconProps) => <Icon {...p}><path d="M18 16.98a3 3 0 1 1-2.83-4" /><path d="M8 5.5A3 3 0 1 1 10 11" /><path d="M6 16a3 3 0 1 0 3-3" /></Icon>;
const TerminalIcon = (p: IconProps) => <Icon {...p}><path d="m5 7 5 5-5 5" /><path d="M12 17h7" /></Icon>;
const PackageIcon = (p: IconProps) => <Icon {...p}><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Icon>;
const PlusIcon = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const CheckIcon = (p: IconProps) => <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>;
const ArrowIcon = (p: IconProps) => <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>;
const MenuIcon = (p: IconProps) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
const CloseIcon = (p: IconProps) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
const GithubIcon = (p: IconProps) => <Icon {...p}><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></Icon>;
const LinkedinIcon = (p: IconProps) => <Icon {...p}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v2a6 6 0 0 1 2-2Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></Icon>;
const XSocialIcon = (p: IconProps) => <Icon {...p}><path d="M4 4l16 16M20 4 4 20" /></Icon>;

/* ============================================================================
   MODULE REGISTRY — single source of truth for every app route
============================================================================ */

const MODULES = [
  { name: 'Dashboard', href: '/dashboard', icon: GaugeIcon, desc: 'Unified ESG overview and org score' },
  { name: 'Environmental', href: '/environmental', icon: LeafIcon, desc: 'Carbon accounting and sustainability goals' },
  { name: 'Social', href: '/social', icon: UsersIcon, desc: 'CSR activities and employee engagement' },
  { name: 'Governance', href: '/governance', icon: ShieldIcon, desc: 'Policies, audits and compliance tracking' },
  { name: 'Gamification', href: '/gamification', icon: TrophyIcon, desc: 'Challenges, badges and rewards' },
  { name: 'Reports', href: '/reports', icon: FileIcon, desc: 'Build and export ESG reports' },
  { name: 'Settings', href: '/settings', icon: KeyIcon, desc: 'Departments, categories and configuration' },
] as const;

/* ============================================================================
   MOTION HOOKS — respects prefers-reduced-motion everywhere
============================================================================ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const listener = () => setReduced(mq.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);
  return reduced;
}

function useReveal<T extends HTMLElement>(reduced: boolean) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);
  return { ref, visible };
}

function Reveal({
  children,
  reduced,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode;
  reduced: boolean;
  className?: string;
  delayMs?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(reduced);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, active: boolean, reduced: boolean, durationMs = 1000) {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, target, durationMs]);
  return value;
}

/* ============================================================================
   SHARED PRIMITIVES
============================================================================ */

function ButtonPrimary({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--green)] px-6 py-3 text-[15px] font-medium text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  );
}

function ButtonSecondary({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--green)] bg-transparent px-6 py-3 text-[15px] font-medium text-[var(--green)] transition-transform duration-150 hover:scale-[1.02] hover:bg-[var(--green)]/10 active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  );
}

function ButtonGhost({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-[14px] font-medium text-[var(--text)]/80 transition-colors duration-150 hover:text-[var(--text)]"
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[12px] font-medium tracking-wide text-[var(--green)]">
      {children}
    </span>
  );
}

/* ============================================================================
   NAVBAR — floating glass pill, collapses on scroll, Solutions mega-dropdown
============================================================================ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-1/2 top-4 z-50 w-[92%] max-w-[980px] -translate-x-1/2 transition-all duration-200 md:w-[78%] ${
          scrolled ? 'top-2' : 'top-4'
        }`}
      >
        <nav
          className={`flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--bg)]/72 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-[20px] backdrop-saturate-[1.4] transition-all duration-200 ${
            scrolled ? 'px-4 py-2' : 'px-6 py-3'
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--green)]">
              <LeafIcon className="h-4 w-4 text-[#0B0F0D]" />
            </span>
            <span className="text-[15px] font-semibold text-[var(--text)]">Syntropy</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button
                className="flex items-center gap-1 rounded-full px-4 py-2 text-[14px] font-medium text-[var(--text)]/80 transition-colors hover:text-[var(--text)]"
                aria-expanded={solutionsOpen}
              >
                Solutions
                <ArrowIcon className="h-3.5 w-3.5 rotate-90 opacity-60" />
              </button>
              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-150 ${
                  solutionsOpen ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none -translate-y-1 opacity-0'
                }`}
              >
                <div className="grid w-[560px] grid-cols-2 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {MODULES.map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--hover)]"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--green)]/10 text-[var(--green)]">
                        <m.icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-[13.5px] font-medium text-[var(--text)]">{m.name}</span>
                        <span className="block text-[12px] text-[var(--muted)]">{m.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <ButtonGhost href="#features">Features</ButtonGhost>
            <ButtonGhost href="#pricing">Pricing</ButtonGhost>
            <ButtonGhost href="#developers">Documentation</ButtonGhost>
            <ButtonGhost href="#faq">About</ButtonGhost>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ButtonGhost href="/dashboard">Login</ButtonGhost>
            <ButtonPrimary href="/dashboard" className="!px-5 !py-2 !text-[14px]">
              Get Started
            </ButtonPrimary>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center text-[var(--text)] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/95 p-4 backdrop-blur-xl md:hidden">
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">Modules</p>
            <div className="mb-3 grid grid-cols-1 gap-1">
              {MODULES.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[14px] text-[var(--text)]/90 hover:bg-[var(--hover)]"
                >
                  <m.icon className="h-4 w-4 text-[var(--green)]" />
                  {m.name}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 border-t border-[var(--border)] pt-3">
              <ButtonSecondary href="/dashboard" className="flex-1 !text-[13px]">
                Login
              </ButtonSecondary>
              <ButtonPrimary href="/dashboard" className="flex-1 !text-[13px]">
                Get Started
              </ButtonPrimary>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ============================================================================
   HERO
============================================================================ */

function Hero({ reduced }: { reduced: boolean }) {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setLoaded(true);
    if (reduced) return;
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const companies = useCountUp(500, statsVisible, reduced);
  const compliance = useCountUp(95, statsVisible, reduced);
  const transactions = useCountUp(1.2, statsVisible, reduced, 1000) as unknown as number;

  const parallax = reduced ? 0 : scrollY * 0.08;

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-40 md:pt-48">
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_70%)]"
        style={{ transform: `translateY(${parallax}px)` }}
      >
        <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[var(--green)]/20 blur-[110px]" />
        <div className="absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-[var(--green)]/15 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] text-center">
        <div
          className={`transition-all duration-700 ease-out ${
            loaded || reduced ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="mb-6 flex justify-center">
            <Eyebrow>Sustainability, operationalized.</Eyebrow>
          </div>
          <h1 className="mx-auto max-w-[900px] text-[40px] font-bold leading-[1.08] tracking-tight text-[var(--text)] md:text-[64px]">
            The Enterprise <span className="text-[var(--heading)]">ESG Operating System</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-[var(--muted)] md:text-[18px]">
            Track carbon emissions, automate compliance, engage employees, and generate ESG
            reports, all from one modern platform.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonPrimary href="/dashboard">
              Get Started <ArrowIcon className="h-4 w-4" />
            </ButtonPrimary>
            <ButtonSecondary href="#developers">Book a Demo</ButtonSecondary>
          </div>
        </div>

        <div
          className={`relative mx-auto mt-16 max-w-[980px] transition-all duration-700 ease-out delay-150 ${
            loaded || reduced ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div
            className={reduced ? '' : 'animate-[float_7s_ease-in-out_infinite]'}
            style={{ willChange: 'transform' }}
          >
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--error)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--green)]/70" />
                <span className="ml-3 text-[12px] text-[var(--muted)]">app.syntropy.io/dashboard</span>
              </div>
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                {[
                  { label: 'Overall ESG Score', value: '78.4', accent: 'var(--green)' },
                  { label: 'Carbon Transactions', value: '12,904', accent: 'var(--info)' },
                  { label: 'Open Compliance Issues', value: '3', accent: 'var(--warning)' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-left">
                    <p className="text-[12px] text-[var(--muted)]">{s.label}</p>
                    <p className="mt-2 text-[26px] font-semibold" style={{ color: s.accent }}>
                      {s.value}
                    </p>
                  </div>
                ))}
                <div className="col-span-full flex h-32 items-end gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  {[40, 65, 50, 80, 60, 90, 70, 95, 75, 100, 85, 92].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-[var(--green)]/70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={statsRef} className="mx-auto mt-20 grid max-w-[720px] grid-cols-3 gap-6">
          {[
            { value: `${companies}+`, label: 'Companies' },
            { value: `${compliance}%`, label: 'Compliance rate' },
            { value: `${transactions.toFixed(1)}M`, label: 'Carbon transactions' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[28px] font-bold text-[var(--heading)] md:text-[36px]">{s.value}</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PRODUCT PILLARS
============================================================================ */

function Pillars({ reduced }: { reduced: boolean }) {
  const items = [
    { m: MODULES[1], color: 'var(--green)', tag: 'Environmental' },
    { m: MODULES[2], color: 'var(--info)', tag: 'Social' },
    { m: MODULES[3], color: '#A855F7', tag: 'Governance' },
  ];
  const copy = [
    'Track emissions and sustainability goals.',
    'Drive engagement and CSR initiatives.',
    'Manage compliance, audits, and policies.',
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal reduced={reduced} delayMs={i * 80} key={it.tag}>
              <Link
                href={it.m.href}
                className="group block h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7 transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${it.color}1A`, color: it.color }}
                >
                  <it.m.icon className="h-5 w-5" />
                </span>
                <span
                  className="mt-5 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: `${it.color}1A`, color: it.color }}
                >
                  {it.tag}
                </span>
                <h3 className="mt-3 text-[19px] font-semibold text-[var(--text)]">{it.m.name}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{copy[i]}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--green)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open module <ArrowIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PROBLEM SECTION
============================================================================ */

function ProblemSection({ reduced }: { reduced: boolean }) {
  const problems = [
    'Manual reporting',
    'Disconnected systems',
    'Low employee engagement',
    'Compliance complexity',
  ];
  return (
    <section className="bg-[var(--hover)] px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <Reveal reduced={reduced} className="text-center">
          <h2 className="mx-auto max-w-[600px] text-[28px] font-bold text-[var(--text)] md:text-[36px]">
            Sustainability shouldn&apos;t live in spreadsheets.
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p, i) => (
            <Reveal reduced={reduced} delayMs={i * 80} key={p}>
              <div className="h-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--warning)]/10 text-[var(--warning)]">
                  <AlertIcon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-4 text-[15px] font-medium text-[var(--text)]">{p}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal reduced={reduced} className="mt-10 text-center">
          <p className="text-[17px] font-medium text-[var(--heading)]">Syntropy centralizes everything.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================
   FEATURES
============================================================================ */

function Features({ reduced }: { reduced: boolean }) {
  const features = [
    { title: 'Carbon Accounting', desc: 'Calculate emissions from real operational data.', icon: LeafIcon, href: '/environmental' },
    { title: 'ESG Dashboards', desc: 'See environmental, social, and governance in one view.', icon: GaugeIcon, href: '/dashboard' },
    { title: 'CSR Activities', desc: 'Organize initiatives and track participation.', icon: UsersIcon, href: '/social' },
    { title: 'Governance Tracking', desc: 'Manage policies, audits, and compliance issues.', icon: ShieldIcon, href: '/governance' },
    { title: 'Challenges and Rewards', desc: 'Turn sustainability goals into team challenges.', icon: TrophyIcon, href: '/gamification' },
    { title: 'Reporting', desc: 'Build custom reports and export in seconds.', icon: FileIcon, href: '/reports' },
    { title: 'Department Scores', desc: 'Compare ESG performance across the org.', icon: ChartIcon, href: '/dashboard' },
    { title: 'AI Insights', desc: 'Predictive scoring and anomaly detection.', icon: SparkIcon, href: undefined, badge: 'Coming soon' },
  ];

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <Reveal reduced={reduced} className="mx-auto max-w-[560px] text-center">
          <Eyebrow>Features</Eyebrow>
          <h2 className="mt-4 text-[28px] font-bold text-[var(--text)] md:text-[36px]">
            Everything ESG, in one platform.
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Wrapper = f.href ? Link : 'div';
            return (
              <Reveal reduced={reduced} delayMs={i * 80} key={f.title}>
                <Wrapper
                  // @ts-expect-error href only applies when Wrapper is Link
                  href={f.href}
                  className={`group block h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all duration-150 ${
                    f.href ? 'hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]' : 'opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--green)]/10 text-[var(--green)]">
                      <f.icon className="h-4.5 w-4.5" />
                    </span>
                    {f.badge && (
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-semibold text-[var(--text)]">{f.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">{f.desc}</p>
                </Wrapper>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   ARCHITECTURE FLOW
============================================================================ */

function Architecture({ reduced }: { reduced: boolean }) {
  const stages = [
    { label: 'ERP Systems', color: 'var(--muted)' },
    { label: 'Carbon Engine', color: 'var(--green)' },
    { label: 'Environmental', color: 'var(--green)' },
    { label: 'Social', color: 'var(--info)' },
    { label: 'Governance', color: '#A855F7' },
    { label: 'Gamification', color: '#F97316' },
    { label: 'ESG Scoring', color: 'var(--heading)' },
    { label: 'Dashboards and Reports', color: 'var(--text)' },
  ];
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-[560px] text-center">
        <Reveal reduced={reduced}>
          <Eyebrow>Architecture</Eyebrow>
          <h2 className="mt-4 text-[28px] font-bold text-[var(--text)] md:text-[36px]">How data flows through Syntropy.</h2>
        </Reveal>
      </div>
      <div className="mx-auto mt-14 flex max-w-[360px] flex-col items-center">
        {stages.map((s, i) => (
          <Reveal reduced={reduced} delayMs={i * 60} key={s.label} className="flex flex-col items-center">
            <div className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[13.5px] font-medium text-[var(--text)]">{s.label}</span>
            </div>
            {i < stages.length - 1 && (
              <div className="flex flex-col items-center py-1.5">
                <div className="h-6 w-px bg-[var(--border)]" />
                <ArrowIcon className="h-3 w-3 -rotate-90 text-[var(--border)]" />
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
   INTEGRATIONS
============================================================================ */

function Integrations({ reduced }: { reduced: boolean }) {
  const items = [
    { name: 'SAP', icon: DbIcon },
    { name: 'Oracle', icon: DbIcon },
    { name: 'Microsoft Dynamics', icon: PackageIcon },
    { name: 'Odoo', icon: PackageIcon },
    { name: 'CSV Import', icon: FileIcon },
    { name: 'REST API', icon: PlugIcon },
  ];
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1280px] text-center">
        <Reveal reduced={reduced}>
          <Eyebrow>Integrations</Eyebrow>
          <h2 className="mt-4 text-[24px] font-semibold text-[var(--text)] md:text-[28px]">
            Connects to the systems you already run.
          </h2>
        </Reveal>
        <Reveal reduced={reduced} delayMs={100} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {items.map((it) => (
            <span
              key={it.name}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[13.5px] text-[var(--text)]/90 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--green)]"
            >
              <it.icon className="h-4 w-4 text-[var(--muted)]" />
              {it.name}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================
   SECURITY
============================================================================ */

function Security({ reduced }: { reduced: boolean }) {
  const items = [
    { label: 'Role-Based Access Control', icon: KeyIcon },
    { label: 'Audit Logs', icon: FileIcon },
    { label: 'Enterprise Authentication', icon: ShieldIcon },
    { label: 'Secure Data Storage', icon: DbIcon },
    { label: 'API Security', icon: LockIcon },
  ];
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1280px]">
        <Reveal reduced={reduced} className="mx-auto max-w-[520px] text-center">
          <Eyebrow>Security</Eyebrow>
          <h2 className="mt-4 text-[24px] font-semibold text-[var(--text)] md:text-[28px]">Built for enterprise trust.</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal reduced={reduced} delayMs={i * 70} key={it.label}>
              <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--green)]/10 text-[var(--green)]">
                  <it.icon className="h-4.5 w-4.5" />
                </span>
                <p className="text-[13px] font-medium text-[var(--text)]">{it.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PRICING
============================================================================ */

function Pricing({ reduced }: { reduced: boolean }) {
  const plans = [
    {
      name: 'Starter',
      desc: 'For small teams beginning their ESG journey.',
      price: '$99',
      period: '/mo',
      features: ['Up to 50 employees', 'Environmental + Social modules', 'CSV import', 'Email support'],
      cta: 'Get Started',
      href: '/dashboard',
    },
    {
      name: 'Professional',
      desc: 'For growing organizations.',
      price: '$399',
      period: '/mo',
      features: ['Up to 500 employees', 'All modules + Gamification', 'REST API access', 'Priority support'],
      cta: 'Get Started',
      href: '/dashboard',
      recommended: true,
    },
    {
      name: 'Enterprise',
      desc: 'For large organizations.',
      price: 'Custom',
      period: '',
      features: ['Unlimited employees', 'SSO and RBAC', 'Dedicated success manager', 'Custom SLAs'],
      cta: 'Contact Sales',
      href: '#developers',
    },
  ];
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-[1280px]">
        <Reveal reduced={reduced} className="mx-auto max-w-[520px] text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-4 text-[28px] font-bold text-[var(--text)] md:text-[36px]">Simple, transparent pricing.</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal reduced={reduced} delayMs={i * 80} key={p.name}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-7 ${
                  p.recommended
                    ? 'border-[var(--green)] bg-[var(--card)] shadow-[0_20px_50px_rgba(34,197,94,0.15)]'
                    : 'border-[var(--border)] bg-[var(--card)]'
                }`}
              >
                {p.recommended && (
                  <span className="mb-4 w-fit rounded-full bg-[var(--green)] px-3 py-1 text-[11px] font-semibold text-white">
                    Recommended
                  </span>
                )}
                <h3 className="text-[18px] font-semibold text-[var(--text)]">{p.name}</h3>
                <p className="mt-1 text-[13.5px] text-[var(--muted)]">{p.desc}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-[var(--text)]">{p.price}</span>
                  <span className="text-[13px] text-[var(--muted)]">{p.period}</span>
                </p>
                <div className={p.recommended ? 'mt-6' : 'mt-6'}>
                  {p.recommended ? (
                    <ButtonPrimary href={p.href} className="w-full">
                      {p.cta}
                    </ButtonPrimary>
                  ) : (
                    <ButtonSecondary href={p.href} className="w-full">
                      {p.cta}
                    </ButtonSecondary>
                  )}
                </div>
                <ul className="mt-7 flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13.5px] text-[var(--text)]/85">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   DEVELOPER SECTION
============================================================================ */

function Developers({ reduced }: { reduced: boolean }) {
  const tabs = [
    { name: 'REST API', icon: CodeIcon },
    { name: 'SDK', icon: PackageIcon },
    { name: 'Webhooks', icon: WebhookIcon },
    { name: 'CLI', icon: TerminalIcon },
  ];
  const [active, setActive] = useState(0);

  const code = `curl https://api.syntropy.io/v1/scores/overall \\
  -H "Authorization: Bearer $SYNTROPY_KEY"

{
  "overall_score": 78.4,
  "environmental": 82.1,
  "social": 74.6,
  "governance": 76.3,
  "updated_at": "2026-07-12T09:15:00Z"
}`;

  return (
    <section id="developers" className="bg-[var(--hover)] px-6 py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal reduced={reduced}>
          <Eyebrow>Developers</Eyebrow>
          <h2 className="mt-4 text-[26px] font-bold text-[var(--text)] md:text-[32px]">
            Built to integrate, not replace.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
            Pull ESG scores into your own tools, or push data in from your ERP. Everything in
            Syntropy is available through a documented API.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActive(i)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                  active === i
                    ? 'border-[var(--green)] bg-[var(--green)]/10 text-[var(--green)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.name}
              </button>
            ))}
          </div>
          <ul className="mt-6 flex flex-col gap-3">
            {tabs.map((t) => (
              <li key={t.name} className="flex items-center gap-2.5 text-[14px] text-[var(--text)]/85">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--green)]/10 text-[var(--green)]">
                  <t.icon className="h-3.5 w-3.5" />
                </span>
                {t.name === 'SDK' ? 'SDKs' : t.name}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal reduced={reduced} delayMs={120}>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0B0F0D] font-mono shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--error)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--green)]/70" />
              <span className="ml-3 text-[12px] text-[var(--muted)]">terminal — {tabs[active].name}</span>
            </div>
            <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed">
              <code className="text-[var(--text)]/90">{code}</code>
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================================
   FAQ
============================================================================ */

function FAQ({ reduced }: { reduced: boolean }) {
  const items = [
    {
      q: 'How is ESG calculated?',
      a: 'Each department gets an Environmental, Social, and Governance score. Those combine into a Department Total Score, and department totals combine into your Overall ESG Score using a weighted average.',
    },
    {
      q: 'Can I integrate with my ERP?',
      a: 'Yes. Syntropy connects to SAP, Oracle, and Microsoft Dynamics, or you can import data via CSV or the REST API.',
    },
    {
      q: 'Can departments have different ESG weights?',
      a: 'The default weighting is Environmental 40%, Social 30%, and Governance 30%, and it\u2019s fully configurable per organization in Settings.',
    },
    {
      q: 'How are reports generated?',
      a: 'Use a prebuilt Environmental, Social, Governance, or ESG Summary report, or combine filters in the Custom Report Builder and export as PDF, Excel, or CSV.',
    },
    {
      q: 'Does Syntropy support custom workflows?',
      a: 'Approval flows for CSR participation, challenges, and compliance issues are configurable, including evidence requirements and auto-calculation toggles.',
    },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-[720px]">
        <Reveal reduced={reduced} className="text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-[28px] font-bold text-[var(--text)] md:text-[36px]">Questions, answered.</h2>
        </Reveal>
        <div className="mt-10 flex flex-col divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {items.map((it, i) => (
            <div key={it.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="text-[15px] font-medium text-[var(--text)]">{it.q}</span>
                <span
                  className="shrink-0 text-[var(--green)] transition-transform duration-300"
                  style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  <PlusIcon className="h-5 w-5" />
                </span>
              </button>
              <div
                className="grid overflow-hidden transition-all duration-300 ease-out"
                style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-[14px] leading-relaxed text-[var(--muted)]">{it.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   FINAL CTA
============================================================================ */

function FinalCTA({ reduced }: { reduced: boolean }) {
  return (
    <section className="px-6 py-24">
      <Reveal reduced={reduced} className="mx-auto max-w-[1280px]">
        <div className="rounded-3xl border border-[var(--border)] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_60%)] px-6 py-16 text-center">
          <h2 className="mx-auto max-w-[560px] text-[28px] font-bold text-[var(--text)] md:text-[36px]">
            Ready to operationalize sustainability?
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-[15px] text-[var(--muted)]">
            Set up your first department and start tracking ESG performance today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonPrimary href="/dashboard">
              Get Started <ArrowIcon className="h-4 w-4" />
            </ButtonPrimary>
            <ButtonSecondary href="#developers">Book a Demo</ButtonSecondary>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================================
   FOOTER
============================================================================ */

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--green)]">
                <LeafIcon className="h-4 w-4 text-[#0B0F0D]" />
              </span>
              <span className="text-[15px] font-semibold text-[var(--text)]">Syntropy</span>
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">Sustainability, operationalized.</p>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted)]">Product</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {MODULES.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted)]">Resources</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><Link href="#developers" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">Documentation</Link></li>
              <li><Link href="#developers" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">API Reference</Link></li>
              <li><Link href="#faq" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted)]">Company</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><Link href="#faq" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">About</Link></li>
              <li><Link href="#pricing" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">Pricing</Link></li>
              <li><Link href="#developers" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">Contact Sales</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted)]">Legal</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><Link href="#" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">Privacy Policy</Link></li>
              <li><Link href="#" className="text-[13.5px] text-[var(--text)]/80 hover:text-[var(--green)]">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-[12.5px] text-[var(--muted)]">&copy; {new Date().getFullYear()} Syntropy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="GitHub" className="text-[var(--muted)] hover:text-[var(--green)]">
              <GithubIcon className="h-4.5 w-4.5" />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="text-[var(--muted)] hover:text-[var(--green)]">
              <LinkedinIcon className="h-4.5 w-4.5" />
            </Link>
            <Link href="#" aria-label="X" className="text-[var(--muted)] hover:text-[var(--green)]">
              <XSocialIcon className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   PAGE
============================================================================ */

export default function Page() {
  const reduced = usePrefersReducedMotion();

  return (
    <div style={tokens} className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <Navbar />
      <main>
        <Hero reduced={reduced} />
        <Pillars reduced={reduced} />
        <ProblemSection reduced={reduced} />
        <Features reduced={reduced} />
        <Architecture reduced={reduced} />
        <Integrations reduced={reduced} />
        <Security reduced={reduced} />
        <Pricing reduced={reduced} />
        <Developers reduced={reduced} />
        <FAQ reduced={reduced} />
        <FinalCTA reduced={reduced} />
      </main>
      <Footer />
    </div>
  );
}