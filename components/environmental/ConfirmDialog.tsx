"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  onConfirm,
  isPending,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border bg-transparent hover:bg-surface-hover">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-error text-white hover:bg-error/90"
          >
            {isPending ? "Deleting..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}