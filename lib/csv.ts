/**
 * Client-side CSV export. No dependencies.
 *
 * Values are escaped per RFC 4180: fields containing commas, quotes, or
 * newlines get wrapped in quotes, and internal quotes are doubled.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(c.value(row))).join(",")
  );
  return [header, ...body].join("\r\n");
}

export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  const csv = toCsv(rows, columns);

  // BOM so Excel opens UTF-8 correctly instead of mangling non-ASCII.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Appends today's date so repeat exports don't overwrite each other. */
export function timestampedFilename(base: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${base}-${date}.csv`;
}