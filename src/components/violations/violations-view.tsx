"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ScrollText, Search } from "lucide-react";
import { toast } from "sonner";
import { updateViolationStatus } from "@/lib/actions/violations";
import { VIOLATION_STATUSES } from "@/lib/constants";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Violation = {
  _id: string;
  plateOrBodyNumberChecked: string;
  violationType: string;
  location: string;
  dateRecorded: string;
  fineAmount: number;
  status: (typeof VIOLATION_STATUSES)[number];
  officerId?: { name: string } | null;
  relatedFranchiseId?: { franchiseNumber: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  recorded: "border-status-expiring/30 bg-status-expiring/10 text-status-expiring",
  paid: "border-status-active/30 bg-status-active/10 text-status-active",
  contested: "border-status-suspended/30 bg-status-suspended/10 text-status-suspended",
  waived: "border-border bg-muted text-muted-foreground",
};

export function ViolationsView({
  violations,
  canUpdateStatus,
}: {
  violations: Violation[];
  canUpdateStatus: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      violations.filter((v) =>
        `${v.plateOrBodyNumberChecked} ${v.location} ${v.officerId?.name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [violations, search]
  );

  async function handleStatusChange(violationId: string, status: string) {
    const result = await updateViolationStatus({ violationId, status });
    if (result.success) {
      toast.success("Violation status updated.");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search violations..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No violations found"
          description="Violations logged from the Enforcement lookup will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate/Body No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v._id}>
                  <TableCell className="font-medium">{v.plateOrBodyNumberChecked}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {v.violationType.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{v.location}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.officerId?.name ?? "—"}
                  </TableCell>
                  <TableCell>{format(new Date(v.dateRecorded), "MMM d, yyyy")}</TableCell>
                  <TableCell>₱{Number(v.fineAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    {canUpdateStatus ? (
                      <Select
                        value={v.status}
                        onValueChange={(value) => handleStatusChange(v._id, String(value))}
                      >
                        <SelectTrigger size="sm" className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VIOLATION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={STATUS_STYLES[v.status]}>
                        {v.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
