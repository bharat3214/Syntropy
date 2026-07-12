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
import { goals } from "@/lib/api-client";
import { toDateInputValue } from "@/lib/format";
import type { EnvironmentalGoal, EnvironmentalGoalInput } from "@/types/environmental";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: EnvironmentalGoal | null;
  departments: { id: string; name: string }[];
  onSaved: () => void;
}

const EMPTY: EnvironmentalGoalInput = {
  name: "",
  departmentId: "",
  targetCo2Kg: 0,
  currentCo2Kg: 0,
  deadline: "",
};

export function GoalDialog({ open, onOpenChange, goal, departments, onSaved }: Props) {
  const [form, setForm] = useState<EnvironmentalGoalInput>(EMPTY);
  const create = useMutation(goals.create);
  const update = useMutation((id: string, data: EnvironmentalGoalInput) =>
    goals.update(id, data)
  );

  useEffect(() => {
    if (goal) {
      setForm({
        name: goal.name,
        departmentId: goal.departmentId,
        targetCo2Kg: parseFloat(goal.targetCo2Kg),
        currentCo2Kg: parseFloat(goal.currentCo2Kg),
        deadline: toDateInputValue(goal.deadline ?? ""),
      });
    } else {
      setForm(EMPTY);
    }
  }, [goal, open]);

  const mutation = goal ? update : create;
  const selectedDepartment = departments.find((d) => d.id === form.departmentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      deadline: new Date(form.deadline).toISOString(),
    };
    const result = goal
      ? await update.mutate(goal.id, payload)
      : await create.mutate(payload);
    if (result) {
      onSaved();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "New Environmental Goal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Goal Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Reduce Fleet Emissions"
              className="bg-background border-border"
            />
            {mutation.fieldErrors.name && (
              <p className="text-xs text-error">{mutation.fieldErrors.name[0]}</p>
            )}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Target CO2 (kg)</Label>
              <Input
                type="number"
                value={form.targetCo2Kg}
                onChange={(e) =>
                  setForm({ ...form, targetCo2Kg: parseFloat(e.target.value) || 0 })
                }
                className="bg-background border-border"
              />
              {mutation.fieldErrors.targetCo2Kg && (
                <p className="text-xs text-error">{mutation.fieldErrors.targetCo2Kg[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Current CO2 (kg)</Label>
              <Input
                type="number"
                value={form.currentCo2Kg}
                onChange={(e) =>
                  setForm({ ...form, currentCo2Kg: parseFloat(e.target.value) || 0 })
                }
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-background border-border"
            />
            {mutation.fieldErrors.deadline && (
              <p className="text-xs text-error">{mutation.fieldErrors.deadline[0]}</p>
            )}
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
              {mutation.isPending ? "Saving..." : goal ? "Save Changes" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}