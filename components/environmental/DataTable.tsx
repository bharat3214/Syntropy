"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
  pageSize?: number;
  toolbarRight?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  isLoading,
  searchPlaceholder = "Search...",
  onSearch,
  getRowId,
  onRowClick,
  emptyLabel = "No records yet.",
  pageSize = 10,
  toolbarRight,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        {onSearch && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder={searchPlaceholder}
              onChange={(e) => {
                onSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9 bg-background border-border"
            />
          </div>
        )}
        {toolbarRight}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortValue && toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium text-muted ${
                    col.sortValue ? "cursor-pointer select-none hover:text-foreground" : ""
                  }`}
                >
                  {col.header}
                  {sortKey === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-24 bg-surface-hover" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-muted"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}

            {!isLoading &&
              pageRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-surface-hover" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border p-4">
          <span className="text-xs text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}