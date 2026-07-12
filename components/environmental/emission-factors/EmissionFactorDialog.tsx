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
import { emissionFactors } from "@/lib/api-client";
import type { EmissionFactor, EmissionFactorInput } from "@/types/environmental";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factor?: EmissionFactor | null;
  onSaved: () => void;
}

const EMPTY: EmissionFactorInput = {
  name: "",
  category: "",
  unit: "",
  co2PerUnit: 0,
  status: "ACTIVE",
};

export function EmissionFactorDialog({ open, onOpenChange, factor, onSaved }: Props) {
  const [form, setForm] = useState<EmissionFactorInput>(EMPTY);
  const create = useMutation(emissionFactors.create);
  const update = useMutation((id: string, data: EmissionFactorInput) =>
    emissionFactors.update(id, data)
  );

  useEffect(() => {
    if (factor) {
      setForm({
        name: factor.name,
        category: factor.category,
        unit: factor.unit,
        co2PerUnit: parseFloat(factor.co2PerUnit),
        status: factor.status,
      });
    } else {
      setForm(EMPTY);
    }
  }, [factor, open]);

  const mutation = factor ? update : create;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = factor
      ? await update.mutate(factor.id, form)
      : await create.mutate(form);
    if (result) {
      onSaved();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>{factor ? "Edit Emission Factor" : "New Emission Factor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-background border-border"
            />
            {mutation.fieldErrors.name && (
              <p className="text-xs text-error">{mutation.fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Fuel, Electricity..."
                className="bg-background border-border"
              />
              {mutation.fieldErrors.category && (
                <p className="text-xs text-error">{mutation.fieldErrors.category[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="litre, kWh..."
                className="bg-background border-border"
              />
              {mutation.fieldErrors.unit && (
                <p className="text-xs text-error">{mutation.fieldErrors.unit[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>CO2 per Unit (kg)</Label>
            <Input
              type="number"
              step="0.0001"
              value={form.co2PerUnit}
              onChange={(e) =>
                setForm({ ...form, co2PerUnit: parseFloat(e.target.value) || 0 })
              }
              className="bg-background border-border"
            />
            {mutation.fieldErrors.co2PerUnit && (
              <p className="text-xs text-error">{mutation.fieldErrors.co2PerUnit[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as EmissionFactorInput["status"] })
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mutation.error && (
            <p className="text-sm text-error">{mutation.error}</p>
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
              {mutation.isPending ? "Saving..." : factor ? "Save Changes" : "Create Factor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}