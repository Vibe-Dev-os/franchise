"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  successMessage = "Done.",
}: {
  trigger: React.ReactElement;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
  successMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.success) {
        toast.success(successMessage);
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={handleConfirm}>
            {pending ? "Please wait..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
