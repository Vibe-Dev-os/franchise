"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format, isBefore } from "date-fns";
import { Plus, UserRound, Pencil, Archive, Search } from "lucide-react";
import { archiveDriver } from "@/lib/actions/drivers";
import { DriverForm } from "@/components/drivers/driver-form";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComboboxOption } from "@/components/combobox";

type Driver = {
  _id: string;
  fullName: string;
  contactNumber: string;
  driversLicenseNumber: string;
  licenseExpiry: string;
  operatorId?: { _id: string; fullName: string } | null;
};

export function DriversView({
  drivers,
  operatorOptions,
  canManage,
}: {
  drivers: Driver[];
  operatorOptions: ComboboxOption[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [, startTransition] = useTransition();

  const filtered = drivers.filter((d) =>
    `${d.fullName} ${d.driversLicenseNumber} ${d.contactNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Driver
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No drivers found"
          description="Register a new driver to get started."
          actionLabel={canManage ? "New Driver" : undefined}
          onAction={canManage ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>License No.</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Contact</TableHead>
                {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((driver) => {
                const expired = isBefore(new Date(driver.licenseExpiry), new Date());
                return (
                  <TableRow key={driver._id}>
                    <TableCell className="font-medium">
                      <Link href={`/drivers/${driver._id}`} className="hover:underline">
                        {driver.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {driver.driversLicenseNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {format(new Date(driver.licenseExpiry), "MMM d, yyyy")}
                        {expired ? (
                          <Badge variant="outline" className="bg-status-expired/15 text-status-expired border-status-expired/30">
                            Expired
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {driver.operatorId?.fullName ?? "—"}
                    </TableCell>
                    <TableCell>{driver.contactNumber}</TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(driver)}>
                            <Pencil className="size-4" />
                          </Button>
                          <ConfirmDialog
                            trigger={
                              <Button variant="ghost" size="icon-sm">
                                <Archive className="size-4" />
                              </Button>
                            }
                            title="Archive driver?"
                            description={`${driver.fullName} will be hidden from active lists.`}
                            confirmLabel="Archive"
                            successMessage="Driver archived."
                            onConfirm={() => archiveDriver(driver._id)}
                          />
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Driver</DialogTitle>
          </DialogHeader>
          <DriverForm
            operatorOptions={operatorOptions}
            onSuccess={() => startTransition(() => setCreateOpen(false))}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          {editing ? (
            <DriverForm
              driverId={editing._id}
              defaultValues={{
                ...editing,
                licenseExpiry: new Date(editing.licenseExpiry),
                operatorId: editing.operatorId?._id ?? "",
              }}
              operatorOptions={operatorOptions}
              onSuccess={() => startTransition(() => setEditing(null))}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
