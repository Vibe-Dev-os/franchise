"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { violationSchema, type ViolationInput } from "@/lib/validations/violation";
import { VIOLATION_TYPES } from "@/lib/constants";
import { logViolation } from "@/lib/actions/violations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
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

const VIOLATION_TYPE_LABELS: Record<(typeof VIOLATION_TYPES)[number], string> = {
  unregistered: "Unregistered",
  expired_franchise: "Expired Franchise",
  suspended_franchise: "Suspended Franchise",
  other: "Other",
};

export function LogViolationDialog({
  open,
  onOpenChange,
  plateOrBodyNumber,
  violationType,
  relatedFranchiseId,
  officerName,
  onLogged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plateOrBodyNumber: string;
  violationType: (typeof VIOLATION_TYPES)[number];
  relatedFranchiseId?: string | null;
  officerName?: string;
  onLogged: (slip: {
    plateOrBodyNumberChecked: string;
    violationType: string;
    location: string;
    fineAmount: number;
    description?: string;
    officerName?: string;
    dateRecorded: string;
  }) => void;
}) {
  const form = useForm({
    resolver: zodResolver(violationSchema),
    values: {
      plateOrBodyNumberChecked: plateOrBodyNumber,
      violationType,
      relatedFranchiseId: relatedFranchiseId ?? "",
      description: "",
      location: "",
      fineAmount: 0,
    },
  });

  async function onSubmit(values: ViolationInput) {
    const result = await logViolation(values);
    if (result.success) {
      toast.success("Violation logged.");
      onOpenChange(false);
      onLogged({ ...values, officerName, dateRecorded: new Date().toISOString() });
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Violation — {plateOrBodyNumber}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="violationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Violation type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VIOLATION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {VIOLATION_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Poblacion Junction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fineAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fine amount (₱)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" {...field} value={field.value as number} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Log Violation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
