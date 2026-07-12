"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsv, timestampedFilename, type CsvColumn } from "@/lib/csv";

interface Props<T> {
  rows: T[];
  columns: CsvColumn<T>[];
  filenameBase: string;
  disabled?: boolean;
}

export function ExportButton<T>({ rows, columns, filenameBase, disabled }: Props<T>) {
  return (
    <Button
      variant="outline"
      className="border-border text-muted hover:text-foreground"
      disabled={disabled || rows.length === 0}
      onClick={() => downloadCsv(timestampedFilename(filenameBase), rows, columns)}
    >
      <Download className="mr-1.5 h-4 w-4" />
      Export CSV
    </Button>
  );
}