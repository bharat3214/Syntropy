"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/environmental/emission-factors", label: "Emission Factors" },
  { href: "/environmental/product-esg-profiles", label: "Product ESG Profiles" },
  { href: "/environmental/carbon-transactions", label: "Carbon Transactions" },
  { href: "/environmental/goals", label: "Environmental Goals" },
];

export default function EnvironmentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <h1 className="text-2xl font-semibold text-brand-heading">Environmental</h1>
        <p className="mt-1 text-sm text-muted">
          Emission tracking, carbon accounting, and sustainability goals.
        </p>

        <nav className="mt-6 flex gap-1 border-b border-border">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}