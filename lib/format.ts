/**
 * The API stores and returns CO2 in kilograms. The UI shows tonnes wherever
 * the number is large enough to warrant it — matching the wireframe, which
 * displays goals as "500 t" rather than "500,000 kg".
 */
export function formatCo2(kg: number | string): string {
  const value = typeof kg === "string" ? parseFloat(kg) : kg;
  if (!Number.isFinite(value)) return "—";

  if (Math.abs(value) >= 1000) {
    const tonnes = value / 1000;
    return `${tonnes.toLocaleString("en-IN", {
      maximumFractionDigits: 1,
    })} t`;
  }

  return `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg`;
}

/** Raw kg, no unit conversion — for tables where precision matters. */
export function formatKg(kg: number | string): string {
  const value = typeof kg === "string" ? parseFloat(kg) : kg;
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatNumber(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const value = typeof n === "string" ? parseFloat(n) : n;
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "2026-07" -> "Jul 26" — for chart axis labels. */
export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const d = new Date(Number(year), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

/** For date inputs, which want "YYYY-MM-DD". */
export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
}