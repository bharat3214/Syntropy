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
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@/hooks/use-environmental";
import { productProfiles } from "@/lib/api-client";
import type { ProductESGProfile, ProductESGProfileInput } from "@/types/environmental";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: ProductESGProfile | null;
  onSaved: () => void;
}

const EMPTY: ProductESGProfileInput = {
  productName: "",
  productCode: "",
  category: "",
  carbonFootprint: undefined,
  sustainableFlag: false,
  notes: "",
};

export function ProductProfileDialog({ open, onOpenChange, profile, onSaved }: Props) {
  const [form, setForm] = useState<ProductESGProfileInput>(EMPTY);
  const create = useMutation(productProfiles.create);
  const update = useMutation((id: string, data: ProductESGProfileInput) =>
    productProfiles.update(id, data)
  );

  useEffect(() => {
    if (profile) {
      setForm({
        productName: profile.productName,
        productCode: profile.productCode,
        category: profile.category ?? "",
        carbonFootprint: profile.carbonFootprint
          ? parseFloat(profile.carbonFootprint)
          : undefined,
        sustainableFlag: profile.sustainableFlag,
        notes: profile.notes ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [profile, open]);

  const mutation = profile ? update : create;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = profile
      ? await update.mutate(profile.id, form)
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
          <DialogTitle>{profile ? "Edit Product Profile" : "New Product ESG Profile"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="bg-background border-border"
              />
              {mutation.fieldErrors.productName && (
                <p className="text-xs text-error">{mutation.fieldErrors.productName[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Product Code</Label>
              <Input
                value={form.productCode}
                onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                className="bg-background border-border"
              />
              {mutation.fieldErrors.productCode && (
                <p className="text-xs text-error">{mutation.fieldErrors.productCode[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Carbon Footprint (kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.carbonFootprint ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  carbonFootprint: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="bg-background border-border"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="cursor-pointer">Sustainable product</Label>
            <Switch
              checked={form.sustainableFlag}
              onCheckedChange={(v) => setForm({ ...form, sustainableFlag: v })}
            />
          </div>

          {mutation.error && <p className="text-sm text-error">{mutation.error}</p>}

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
              {mutation.isPending ? "Saving..." : profile ? "Save Changes" : "Create Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}