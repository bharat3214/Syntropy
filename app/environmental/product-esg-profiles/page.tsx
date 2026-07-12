"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Leaf } from "lucide-react";
import { DataTable, type Column } from "@/components/environmental/DataTable";
import { StatusBadge } from "@/components/environmental/StatusBadge";
import { ExportButton } from "@/components/environmental/ExportButton";
import { ConfirmDialog } from "@/components/environmental/ConfirmDialog";
import { ProductProfileDialog } from "@/components/environmental/product-esg-profiles/ProductProfileDialog";
import { useProductProfiles } from "@/hooks/use-environmental";
import { productProfiles } from "@/lib/api-client";
import { formatNumber } from "@/lib/format";
import type { CsvColumn } from "@/lib/csv";
import type { ProductESGProfile } from "@/types/environmental";

export default function ProductESGProfilesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useProductProfiles({ search });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductESGProfile | null>(null);

  const [deleting, setDeleting] = useState<ProductESGProfile | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(profile: ProductESGProfile) {
    setEditing(profile);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    setDeleteError(null);
    try {
      await productProfiles.remove(deleting.id);
      setDeleting(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(null);
    } finally {
      setDeletePending(false);
    }
  }

  const columns: Column<ProductESGProfile>[] = [
    {
      key: "productName",
      header: "Product",
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.sustainableFlag && <Leaf className="h-4 w-4 text-brand" />}
          {r.productName}
        </div>
      ),
      sortValue: (r) => r.productName,
    },
    { key: "productCode", header: "Code", render: (r) => r.productCode },
    { key: "category", header: "Category", render: (r) => r.category ?? "—" },
    {
      key: "carbonFootprint",
      header: "Carbon Footprint (kg)",
      render: (r) => formatNumber(r.carbonFootprint),
      sortValue: (r) => parseFloat(r.carbonFootprint ?? "0"),
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

  const csvColumns: CsvColumn<ProductESGProfile>[] = [
    { header: "Product Name", value: (r) => r.productName },
    { header: "Product Code", value: (r) => r.productCode },
    { header: "Category", value: (r) => r.category ?? "" },
    { header: "Carbon Footprint (kg)", value: (r) => r.carbonFootprint ?? "" },
    { header: "Sustainable", value: (r) => (r.sustainableFlag ? "Yes" : "No") },
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
        searchPlaceholder="Search products..."
        emptyLabel="No product ESG profiles yet."
        toolbarRight={
          <div className="flex gap-2">
            <ExportButton
              rows={data ?? []}
              columns={csvColumns}
              filenameBase="product-esg-profiles"
            />
            <Button className="bg-brand text-white hover:bg-brand/90" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Profile
            </Button>
          </div>
        }
      />

      <ProductProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        profile={editing}
        onSaved={refetch}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete product profile"
        description={`"${deleting?.productName}" will be permanently removed. This can't be undone.`}
        onConfirm={confirmDelete}
        isPending={deletePending}
      />
    </div>
  );
}