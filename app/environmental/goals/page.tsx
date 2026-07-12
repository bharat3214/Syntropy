"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/environmental/DataTable";
import { StatusBadge } from "@/components/environmental/StatusBadge";
import { ExportButton } from "@/components/environmental/ExportButton";
import { ConfirmDialog } from "@/components/environmental/ConfirmDialog";
import { GoalDialog } from "@/components/environmental/goals/GoalDialog";
import { useDepartmentSummaries, useGoals } from "@/hooks/use-environmental";
import { goals } from "@/lib/api-client";
import { formatCo2, formatDate } from "@/lib/format";
import type { CsvColumn } from "@/lib/csv";
import type { EnvironmentalGoal } from "@/types/environmental";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-xs text-muted">{value}%</span>
    </div>
  );
}

export default function EnvironmentalGoalsPage() {
  const { data, isLoading, error, refetch } = useGoals();
  const { data: departments } = useDepartmentSummaries();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EnvironmentalGoal | null>(null);

  const [deleting, setDeleting] = useState<EnvironmentalGoal | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Goals endpoint has no search param, so filter client-side.
  const filtered = (data ?? []).filter(
    (g) =>
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.department?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(goal: EnvironmentalGoal) {
    setEditing(goal);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await goals.remove(deleting.id);
      setDeleting(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(null);
    } finally {
      setDeletePending(false);
    }
  }

  const columns: Column<EnvironmentalGoal>[] = [
    { key: "name", header: "Name", render: (r) => r.name, sortValue: (r) => r.name },
    { key: "department", header: "Department", render: (r) => r.department?.name ?? "—" },
    { key: "targetCo2Kg", header: "Target CO2", render: (r) => formatCo2(r.targetCo2Kg) },
    { key: "currentCo2Kg", header: "Current CO2", render: (r) => formatCo2(r.currentCo2Kg) },
    {
      key: "progress",
      header: "Progress",
      render: (r) => <ProgressBar value={r.progress} />,
      sortValue: (r) => r.progress,
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (r) => formatDate(r.deadline),
      sortValue: (r) => r.deadline,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteError(null);
            setDeleting(r);
          }}
          className="text-muted hover:text-error"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const csvColumns: CsvColumn<EnvironmentalGoal>[] = [
    { header: "Name", value: (r) => r.name },
    { header: "Department", value: (r) => r.department?.name ?? "" },
    { header: "Target CO2 (kg)", value: (r) => r.targetCo2Kg },
    { header: "Current CO2 (kg)", value: (r) => r.currentCo2Kg },
    { header: "Progress (%)", value: (r) => r.progress },
    { header: "Deadline", value: (r) => r.deadline },
    { header: "Status", value: (r) => r.status },
  ];

  return (
    <div className="space-y-4">
      {(error || deleteError) && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error ?? deleteError}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filtered}
        isLoading={isLoading}
        getRowId={(r) => r.id}
        onSearch={setSearch}
        onRowClick={openEdit}
        searchPlaceholder="Search goals..."
        emptyLabel="No sustainability goals set yet."
        toolbarRight={
          <div className="flex gap-2">
            <ExportButton
              rows={filtered}
              columns={csvColumns}
              filenameBase="environmental-goals"
            />
            <Button className="bg-brand text-white hover:bg-brand/90" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Goal
            </Button>
          </div>
        }
      />

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={editing}
        departments={(departments ?? []).map((d) => ({
          id: d.departmentId,
          name: d.departmentName,
        }))}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete goal"
        description={`"${deleting?.name}" will be permanently removed. This can't be undone.`}
        onConfirm={confirmDelete}
        isPending={deletePending}
      />
    </div>
  );
}