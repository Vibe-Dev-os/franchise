"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format, differenceInCalendarDays } from "date-fns";
import { Plus, FileBadge, Pencil, Search, RefreshCcw, Ban, ShieldOff, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { setFranchiseStatus } from "@/lib/actions/franchises";
import {
  FranchiseForm,
  type FranchiseFormOperator,
  type FranchiseFormDriver,
  type FranchiseFormVehicle,
} from "@/components/franchises/franchise-form";
import { RenewFranchiseDialog } from "@/components/franchises/renew-franchise-dialog";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FranchiseStatus } from "@/lib/models/Franchise";

export type FranchiseRow = {
  _id: string;
  franchiseNumber: string;
  routeOrZone: string;
  expiryDate: string;
  dateIssued: string;
  status: FranchiseStatus;
  feePaid: boolean;
  feeAmount: number;
  driverId?: { _id: string; fullName: string } | null;
  vehicleId?: { _id: string; plateOrBodyNumber: string; vehicleType: string } | null;
  operatorId?: { _id: string; fullName: string } | null;
};

const STATUS_TABS: { value: FranchiseStatus | "all" | "expiring30"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expiring30", label: "Expiring in 30 Days" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
  { value: "revoked", label: "Revoked" },
];

export function FranchisesView({
  franchises,
  operators,
  drivers,
  vehicles,
  zones,
  canManage,
}: {
  franchises: FranchiseRow[];
  operators: FranchiseFormOperator[];
  drivers: FranchiseFormDriver[];
  vehicles: FranchiseFormVehicle[];
  zones: string[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FranchiseRow | null>(null);
  const [renewing, setRenewing] = useState<FranchiseRow | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return franchises.filter((f) => {
      const matchesSearch = `${f.franchiseNumber} ${f.driverId?.fullName ?? ""} ${
        f.vehicleId?.plateOrBodyNumber ?? ""
      } ${f.routeOrZone}`
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (tab === "all") return true;
      if (tab === "expiring30") {
        return (
          differenceInCalendarDays(new Date(f.expiryDate), new Date()) <= 30 &&
          f.status !== "expired"
        );
      }
      return f.status === tab;
    });
  }, [franchises, search, tab]);

  async function handleSetStatus(id: string, status: "suspended" | "revoked" | "active") {
    const result = await setFranchiseStatus(id, status);
    if (result.success) {
      toast.success(`Franchise ${status}.`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search franchises..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Franchise
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileBadge}
          title="No franchises found"
          description="Issue a new franchise to get started."
          actionLabel={canManage ? "New Franchise" : undefined}
          onAction={canManage ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Franchise No.</TableHead>
                <TableHead>Driver / Vehicle</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f._id}>
                  <TableCell className="font-medium">
                    <Link href={`/franchises/${f._id}`} className="hover:underline">
                      {f.franchiseNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {f.driverId?.fullName ?? "—"} · {f.vehicleId?.plateOrBodyNumber ?? "—"}
                  </TableCell>
                  <TableCell>{f.routeOrZone}</TableCell>
                  <TableCell>{format(new Date(f.expiryDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <StatusBadge status={f.status} />
                  </TableCell>
                  <TableCell>
                    <span className={f.feePaid ? "text-status-active" : "text-status-expired"}>
                      {f.feePaid ? "Paid" : "Unpaid"}
                    </span>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Renew"
                          onClick={() => setRenewing(f)}
                        >
                          <RefreshCcw className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(f)}>
                          <Pencil className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            {f.status !== "suspended" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  startTransition(() => handleSetStatus(f._id, "suspended"))
                                }
                              >
                                <ShieldOff className="size-4" />
                                Suspend
                              </DropdownMenuItem>
                            ) : null}
                            {f.status !== "revoked" ? (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  startTransition(() => handleSetStatus(f._id, "revoked"))
                                }
                              >
                                <Ban className="size-4" />
                                Revoke
                              </DropdownMenuItem>
                            ) : null}
                            {(f.status === "suspended" || f.status === "revoked") ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  startTransition(() => handleSetStatus(f._id, "active"))
                                }
                              >
                                <RefreshCcw className="size-4" />
                                Reinstate
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Franchise</DialogTitle>
          </DialogHeader>
          <FranchiseForm
            operators={operators}
            drivers={drivers}
            vehicles={vehicles}
            zones={zones}
            onSuccess={() => startTransition(() => setCreateOpen(false))}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Franchise</DialogTitle>
          </DialogHeader>
          {editing ? (
            <FranchiseForm
              franchiseId={editing._id}
              defaultValues={{
                operatorId: editing.operatorId?._id ?? "",
                driverId: editing.driverId?._id ?? "",
                vehicleId: editing.vehicleId?._id ?? "",
                routeOrZone: editing.routeOrZone,
                dateIssued: new Date(editing.dateIssued),
                expiryDate: new Date(editing.expiryDate),
                feeAmount: editing.feeAmount,
                feePaid: editing.feePaid,
              }}
              operators={operators}
              drivers={drivers}
              vehicles={vehicles}
              zones={zones}
              onSuccess={() => startTransition(() => setEditing(null))}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {renewing ? (
        <RenewFranchiseDialog
          franchise={renewing}
          open={!!renewing}
          onOpenChange={(open) => !open && setRenewing(null)}
        />
      ) : null}
    </div>
  );
}
