"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Zap } from "lucide-react";
import { useMutation } from "@/hooks/use-environmental";
import { emissionFactors } from "@/lib/api-client";
import type { EmissionFactor } from "@/types/environmental";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string }[];
  onSaved: () => void;
}

type SourceType = "PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET";

interface AutoCalcForm {
  departmentId: string;
  emissionFactorId: string;
  sourceType: SourceType;
  sourceRef: string;
  activityAmount: number;
}

const EMPTY: AutoCalcForm = {
  departmentId: "",
  emissionFactorId: "",
  sourceType: "PURCHASE",
  sourceRef: "",
  activityAmount: 0,
};

async function autoCalculate(data: AutoCalcForm) {
  const res = await fetch("/api/environmental/carbon-transactions/auto-calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) {
    const err = new Error(json.error) as Error & { details?: unknown };
    err.details = json.details;
    throw err;
  }
  return json.data;
}

export function AutoCalculateDialog({ open, onOpenChange, departments, onSaved }: Props) {
  const [form, setForm] = useState<AutoCalcForm>(EMPTY);
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const mutation = useMutation(autoCalculate);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      mutation.reset();
      emissionFactors.list({ status: "ACTIVE" }).then(setFactors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedFactor = factors.find((f) => f.id === form.emissionFactorId);
  const selectedDepartment = departments.find((d) => d.id === form.departmentId);

  const estimated =
    selectedFactor && form.activityAmount
      ? (form.activityAmount * parseFloat(selectedFactor.co2PerUnit)).toFixed(2)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await mutation.mutate(form);
    if (result) {
      onSaved();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand" />
            Auto-Calculate from ERP Record
          </DialogTitle>
          <DialogDescription className="text-muted">
            Links an ERP record to an emission factor. CO2 is calculated
            automatically — no manual entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Source Type</Label>
              <Select
                value={form.sourceType}
                onValueChange={(v) =>
                  setForm({ ...form, sourceType: (v ?? "PURCHASE") as SourceType })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="FLEET">Fleet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Source Record ID</Label>
              <Input
                value={form.sourceRef}
                onChange={(e) => setForm({ ...form, sourceRef: e.target.value })}
                placeholder="PO-2026-0781"
                className="bg-background border-border"
              />
              {mutation.fieldErrors.sourceRef && (
                <p className="text-xs text-error">{mutation.fieldErrors.sourceRef[0]}</p>
              )}
            </div>
          </div>

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
            {mutation.fieldErrors.departmentId && (
              <p className="text-xs text-error">{mutation.fieldErrors.departmentId[0]}</p>
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
            {mutation.fieldErrors.emissionFactorId && (
              <p className="text-xs text-error">{mutation.fieldErrors.emissionFactorId[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Activity Amount {selectedFactor ? `(${selectedFactor.unit})` : ""}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={form.activityAmount}
              onChange={(e) =>
                setForm({ ...form, activityAmount: parseFloat(e.target.value) || 0 })
              }
              className="bg-background border-border"
            />
            {mutation.fieldErrors.activityAmount && (
              <p className="text-xs text-error">{mutation.fieldErrors.activityAmount[0]}</p>
            )}
            {estimated && (
              <p className="text-xs text-brand">Will calculate to {estimated} kg CO2</p>
            )}
          </div>

          {mutation.error && (
            <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
              {mutation.error}
            </div>
          )}

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
              disabled={mutation.isPending}
              className="bg-brand text-white hover:bg-brand/90"
            >
              {mutation.isPending ? "Calculating..." : "Auto-Calculate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}