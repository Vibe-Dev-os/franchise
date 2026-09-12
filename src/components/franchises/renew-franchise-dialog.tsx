"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import { renewFranchise } from "@/lib/actions/franchises";
import { renewFranchiseSchema, type RenewFranchiseInput } from "@/lib/validations/franchise";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function RenewFranchiseDialog({
  franchise,
  open,
  onOpenChange,
}: {
  franchise: { _id: string; franchiseNumber: string; expiryDate: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const nextYear = new Date(franchise.expiryDate);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const form = useForm({
    resolver: zodResolver(renewFranchiseSchema),
    defaultValues: { franchiseId: franchise._id, newExpiryDate: nextYear },
  });

  async function onSubmit(values: RenewFranchiseInput) {
    setSubmitting(true);
    const result = await renewFranchise(values);
    setSubmitting(false);

    if (result.success) {
      toast.success("Franchise renewed.");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renew Franchise {franchise.franchiseNumber}</DialogTitle>
          <DialogDescription>
            Current expiry: {format(new Date(franchise.expiryDate), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New expiry date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value as Date} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Renewing..." : "Confirm Renewal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
