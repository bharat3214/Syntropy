"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEnvironmentalDashboard, useDepartmentSummaries } from "@/hooks/use-environmental";
import { formatCo2, formatMonthLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

function Tile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted">{label}</p>
      <p className="font-medium text-foreground">{formatCo2(payload[0].value)}</p>
    </div>
  );
}

function TrendChart({ data }: { data: { month: string; co2Kg: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-foreground">Emissions Trend (12 mo)</p>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="co2Kg"
              stroke="var(--color-chart-environmental)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-chart-environmental)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DepartmentBarChart({
  data,
}: {
  data: { departmentName: string; totalCo2Kg: number }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-foreground">Department ESG Ranking</p>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="departmentName"
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="totalCo2Kg" fill="var(--color-chart-environmental)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function EnvironmentalDashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useEnvironmentalDashboard();
  const { data: departments, isLoading: deptLoading } = useDepartmentSummaries();

  if (dashLoading || deptLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-surface-hover" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Tile
          label="Total Emissions"
          value={formatCo2(dashboard?.totalCo2Kg ?? 0)}
          accent="text-brand-heading"
        />
        <Tile label="Active Goals" value={String(dashboard?.activeGoals ?? 0)} />
        <Tile
          label="Completed Goals"
          value={String(dashboard?.completedGoals ?? 0)}
          accent="text-brand"
        />
        <Tile
          label="At Risk Goals"
          value={String(dashboard?.atRiskGoals ?? 0)}
          accent="text-warning"
        />
      </div>

      <TrendChart data={dashboard?.monthlyTrend ?? []} />

      <DepartmentBarChart
        data={(departments ?? []).map((d) => ({
          departmentName: d.departmentName,
          totalCo2Kg: d.totalCo2Kg,
        }))}
      />
    </div>
  );
}