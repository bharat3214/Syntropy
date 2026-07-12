"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/environmental/DataTable";
import { StatusBadge } from "@/components/environmental/StatusBadge";
import { ExportButton } from "@/components/environmental/ExportButton";
import { ConfirmDialog } from "@/components/environmental/ConfirmDialog";
import { EmissionFactorDialog } from "@/components/environmental/emission-factors/EmissionFactorDialog";
import { useEmissionFactors } from "@/hooks/use-environmental";
import { emissionFactors } from "@/lib/api-client";
import { formatDate, formatNumber } from "@/lib/format";
import type { CsvColumn } from "@/lib/csv";
import type { EmissionFactor } from "@/types/environmental";

export default function EmissionFactorsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useEmissionFactors({ search });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmissionFactor | null>(null);

  const [deleting, setDeleting] = useState<EmissionFactor | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(factor: EmissionFactor) {
    setEditing(factor);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await emissionFactors.remove(deleting.id);
      setDeleting(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(null);
    } finally {
      setDeletePending(false);
    }
  }

  const columns: Column<EmissionFactor>[] = [
    { key: "name", header: "Name", render: (r) => r.name, sortValue: (r) => r.name },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "unit", header: "Unit", render: (r) => r.unit },
    {
      key: "co2PerUnit",
      header: "CO2 / Unit (kg)",
      render: (r) => formatNumber(r.co2PerUnit),
      sortValue: (r) => parseFloat(r.co2PerUnit),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "updatedAt", header: "Updated", render: (r) => formatDate(r.updatedAt) },
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

  const csvColumns: CsvColumn<EmissionFactor>[] = [
    { header: "Name", value: (r) => r.name },
    { header: "Category", value: (r) => r.category },
    { header: "Unit", value: (r) => r.unit },
    { header: "CO2 per Unit (kg)", value: (r) => r.co2PerUnit },
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
        rows={data ?? []}
        isLoading={isLoading}
        getRowId={(r) => r.id}
        onSearch={setSearch}
        onRowClick={openEdit}
        searchPlaceholder="Search factors..."
        emptyLabel="No emission factors yet. Add one to start tracking emissions."
        toolbarRight={
          <div className="flex gap-2">
            <ExportButton
              rows={data ?? []}
              columns={csvColumns}
              filenameBase="emission-factors"
            />
            <Button className="bg-brand text-white hover:bg-brand/90" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Factor
            </Button>
          </div>
        }
      />

      <EmissionFactorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        factor={editing}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete emission factor"
        description={`"${deleting?.name}" will be permanently removed. This can't be undone.`}
        onConfirm={confirmDelete}
        isPending={deletePending}
      />
    </div>
  );
}