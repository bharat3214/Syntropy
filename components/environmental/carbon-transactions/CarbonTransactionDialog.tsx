"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@/hooks/use-environmental";
import { carbonTransactions, emissionFactors } from "@/lib/api-client";
import type { CarbonTransactionInput, EmissionFactor } from "@/types/environmental";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string }[];
  onSaved: () => void;
}

const EMPTY: CarbonTransactionInput = {
  departmentId: "",
  emissionFactorId: "",
  activityAmount: 0,
  sourceType: "MANUAL",
};

export function CarbonTransactionDialog({ open, onOpenChange, departments, onSaved }: Props) {
  const [form, setForm] = useState<CarbonTransactionInput>(EMPTY);
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const create = useMutation(carbonTransactions.create);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      emissionFactors.list({ status: "ACTIVE" }).then(setFactors);
    }
  }, [open]);

  const selectedFactor = factors.find((f) => f.id === form.emissionFactorId);
  const selectedDepartment = departments.find((d) => d.id === form.departmentId);

  const estimatedCo2 =
    selectedFactor && form.activityAmount
      ? (form.activityAmount * parseFloat(selectedFactor.co2PerUnit)).toFixed(2)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await create.mutate(form);
    if (result) {
      onSaved();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Log Carbon Data</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select
              value={form.departmentId}
              onValueChange={(v) => setForm({ ...form, departmentId: v ?? "" })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select department">
                  {selectedDepartment?.name ?? "Select department"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {create.fieldErrors.departmentId && (
              <p className="text-xs text-error">{create.fieldErrors.departmentId[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Emission Factor</Label>
            <Select
              value={form.emissionFactorId}
              onValueChange={(v) => setForm({ ...form, emissionFactorId: v ?? "" })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select factor">
                  {selectedFactor
                    ? `${selectedFactor.name} (${selectedFactor.unit})`
                    : "Select factor"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {factors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {create.fieldErrors.emissionFactorId && (
              <p className="text-xs text-error">{create.fieldErrors.emissionFactorId[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Activity Amount {selectedFactor ? `(${selectedFactor.unit})` : ""}</Label>
            <Input
              type="number"
              step="0.01"
              value={form.activityAmount}
              onChange={(e) =>
                setForm({ ...form, activityAmount: parseFloat(e.target.value) || 0 })
              }
              className="bg-background border-border"
            />
            {create.fieldErrors.activityAmount && (
              <p className="text-xs text-error">{create.fieldErrors.activityAmount[0]}</p>
            )}
            {estimatedCo2 && (
              <p className="text-xs text-brand">≈ {estimatedCo2} kg CO2 (computed on save)</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Source Type</Label>
            <Select
              value={form.sourceType}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  sourceType: (v ?? "MANUAL") as CarbonTransactionInput["sourceType"],
                })
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="FLEET">Fleet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {create.error && <p className="text-sm text-error">{create.error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {create.isPending ? "Saving..." : "Log Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}