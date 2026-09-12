"use client";

import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ViolationSlipData = {
  plateOrBodyNumberChecked: string;
  violationType: string;
  location: string;
  fineAmount: number;
  description?: string;
  officerName?: string;
  dateRecorded: string;
};

export function PrintSlipDialog({
  slip,
  open,
  onOpenChange,
}: {
  slip: ViolationSlipData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!slip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="print:shadow-none">
        <DialogHeader>
          <DialogTitle>Violation Slip</DialogTitle>
        </DialogHeader>
        <div id="violation-slip" className="space-y-3 rounded-lg border border-border p-4 text-sm">
          <div className="text-center">
            <p className="font-semibold">LGU Midsalip — Franchise Monitoring</p>
            <p className="text-muted-foreground">Violation Slip</p>
          </div>
          <dl className="grid grid-cols-2 gap-y-2">
            <dt className="text-muted-foreground">Plate/Body No.</dt>
            <dd className="text-right font-medium">{slip.plateOrBodyNumberChecked}</dd>
            <dt className="text-muted-foreground">Violation type</dt>
            <dd className="text-right font-medium capitalize">
              {slip.violationType.replace(/_/g, " ")}
            </dd>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="text-right font-medium">{slip.location}</dd>
            <dt className="text-muted-foreground">Fine amount</dt>
            <dd className="text-right font-medium">₱{Number(slip.fineAmount).toLocaleString()}</dd>
            <dt className="text-muted-foreground">Officer</dt>
            <dd className="text-right font-medium">{slip.officerName ?? "—"}</dd>
            <dt className="text-muted-foreground">Date recorded</dt>
            <dd className="text-right font-medium">
              {format(new Date(slip.dateRecorded), "MMM d, yyyy h:mm a")}
            </dd>
          </dl>
          {slip.description ? (
            <p className="border-t border-dashed border-border pt-2 text-muted-foreground">
              {slip.description}
            </p>
          ) : null}
        </div>
        <Button onClick={() => window.print()} className="w-full">
          <Printer className="size-4" />
          Print Slip
        </Button>
      </DialogContent>
    </Dialog>
  );
}
