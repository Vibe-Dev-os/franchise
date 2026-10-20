"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Loader2,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import { quickLookup, listRecentInspections } from "@/lib/actions/violations";
import type { LookupResult, PastViolation } from "@/lib/actions/violations";
import { LogViolationDialog } from "@/components/enforcement/log-violation-dialog";
import { PrintSlipDialog, type ViolationSlipData } from "@/components/enforcement/print-slip-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type InspectionLogRow = {
  _id: string;
  searchedValue: string;
  result: string;
  timestamp: string;
};

const RESULT_META: Record<
  string,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  valid_franchise: {
    label: "Valid / Active",
    icon: CheckCircle2,
    className: "border-status-active/30 bg-status-active/10 text-status-active",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className: "border-status-expired/30 bg-status-expired/10 text-status-expired",
  },
  suspended: {
    label: "Suspended / Revoked",
    icon: ShieldAlert,
    className: "border-status-suspended/30 bg-status-suspended/10 text-status-suspended",
  },
  not_found_unregistered: {
    label: "UNREGISTERED",
    icon: AlertTriangle,
    className: "border-status-expired/40 bg-status-expired/15 text-status-expired",
  },
};

const VIOLATION_STATUS_STYLES: Record<string, string> = {
  recorded: "border-status-expiring/30 bg-status-expiring/10 text-status-expiring",
  paid: "border-status-active/30 bg-status-active/10 text-status-active",
  contested: "border-status-suspended/30 bg-status-suspended/10 text-status-suspended",
  waived: "border-border bg-muted text-muted-foreground",
};

export function EnforcementView({
  officerName,
  initialInspections,
}: {
  officerName: string;
  initialInspections: InspectionLogRow[];
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [inspections, setInspections] = useState(initialInspections);
  const [violationOpen, setViolationOpen] = useState(false);
  const [slip, setSlip] = useState<ViolationSlipData | null>(null);
  const [slipOpen, setSlipOpen] = useState(false);
  const [, startTransition] = useTransition();

  async function refreshInspections() {
    const logs = await listRecentInspections(10);
    setInspections(logs);
  }

  async function handleLookup() {
    if (!query.trim()) {
      toast.error("Enter a plate or franchise number.");
      return;
    }
    setLoading(true);
    const res = await quickLookup({ query });
    setLoading(false);

    if (res.success) {
      setResult(res.data);
      startTransition(refreshInspections);
    } else {
      toast.error(res.error);
    }
  }

  const violationTypeForResult: "unregistered" | "expired_franchise" | "suspended_franchise" =
    result?.result === "expired"
      ? "expired_franchise"
      : result?.result === "suspended"
        ? "suspended_franchise"
        : "unregistered";

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="Enter plate number or franchise number..."
                className="h-12 pl-10 text-base"
              />
            </div>
            <Button size="lg" className="h-12" onClick={handleLookup} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Check Status
            </Button>
          </div>

          {result ? (
            <ResultCard
              result={result}
              onLogViolation={() => setViolationOpen(true)}
            />
          ) : null}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="size-4" />
          Recent Inspections
        </h2>
        {inspections.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No inspections yet"
            description="Your recent lookups will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <ul className="divide-y divide-border">
              {inspections.map((log) => {
                const meta = RESULT_META[log.result];
                const Icon = meta?.icon ?? Clock;
                return (
                  <li key={log._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-muted-foreground" />
                      {log.searchedValue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={meta?.className}>
                        {meta?.label ?? log.result}
                      </Badge>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {format(new Date(log.timestamp), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {result ? (
        <LogViolationDialog
          open={violationOpen}
          onOpenChange={setViolationOpen}
          plateOrBodyNumber={result.query}
          violationType={violationTypeForResult}
          relatedFranchiseId={result.franchise?._id ?? null}
          officerName={officerName}
          onLogged={(slipData) => {
            setSlip(slipData);
            setSlipOpen(true);
          }}
        />
      ) : null}

      <PrintSlipDialog slip={slip} open={slipOpen} onOpenChange={setSlipOpen} />
    </div>
  );
}

function ResultCard({
  result,
  onLogViolation,
}: {
  result: LookupResult;
  onLogViolation: () => void;
}) {
  const meta = RESULT_META[result.result];
  const Icon = meta.icon;
  const franchise = result.franchise;
  const isUnregistered = result.result === "not_found_unregistered";
  const pastViolations: PastViolation[] = result.pastViolations ?? [];

  return (
    <div className="space-y-3">
      <div className={`animate-in rounded-xl border p-5 ${meta.className}`}>
        <div className="flex items-start gap-3">
          <Icon className="size-8 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-lg font-semibold">{meta.label}</p>
            {isUnregistered ? (
              <p className="text-sm font-medium">
                No franchise record found for &quot;{result.query}&quot; — this vehicle is
                UNREGISTERED.
              </p>
            ) : franchise ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <p>
                  <span className="opacity-70">Franchise:</span> {franchise.franchiseNumber}
                </p>
                <p>
                  <span className="opacity-70">Driver:</span>{" "}
                  {(franchise.driverId as { fullName?: string } | null)?.fullName ?? "—"}
                </p>
                <p>
                  <span className="opacity-70">Vehicle:</span>{" "}
                  {(franchise.vehicleId as { plateOrBodyNumber?: string } | null)?.plateOrBodyNumber ??
                    "—"}
                </p>
                <p>
                  <span className="opacity-70">Route/Zone:</span> {franchise.routeOrZone as string}
                </p>
                <p>
                  <span className="opacity-70">Expiry:</span>{" "}
                  {format(new Date(franchise.expiryDate), "MMM d, yyyy")}
                </p>
              </div>
            ) : null}
            {result.result !== "valid_franchise" ? (
              <Button size="sm" variant="outline" className="mt-2 bg-background" onClick={onLogViolation}>
                Log Violation
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Past violations for this plate */}
      {pastViolations.length > 0 ? (
        <div className="rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <ScrollText className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              Past Violations ({pastViolations.length})
            </span>
          </div>
          <ul className="divide-y divide-border">
            {pastViolations.map((v) => (
              <li key={v._id} className="grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {v.violationType.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline" className={VIOLATION_STATUS_STYLES[v.status] ?? ""}>
                    {v.status}
                  </Badge>
                </div>
                <div className="text-right text-muted-foreground">
                  ₱{Number(v.fineAmount).toLocaleString()} &mdash;{" "}
                  {format(new Date(v.dateRecorded), "MMM d, yyyy")}
                </div>
                <div className="text-muted-foreground">{v.location}</div>
                <div className="text-right text-muted-foreground">
                  {v.officerId?.name ?? "—"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        result.result !== "valid_franchise" && (
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
            <ScrollText className="size-4" />
            No previous violations on record for this plate.
          </div>
        )
      )}
    </div>
  );
}
