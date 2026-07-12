import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-brand/10 text-brand border-brand/30",
  ON_TRACK: "bg-info/10 text-info border-info/30",
  AT_RISK: "bg-warning/10 text-warning border-warning/30",
  COMPLETED: "bg-brand/10 text-brand border-brand/30",
  ARCHIVED: "bg-muted/10 text-muted border-muted/30",
  INACTIVE: "bg-muted/10 text-muted border-muted/30",
};

const LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
  INACTIVE: "Inactive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? "bg-muted/10 text-muted border-muted/30"
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}