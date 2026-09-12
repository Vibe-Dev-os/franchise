"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Bike, Pencil, Archive, Search } from "lucide-react";
import { archiveVehicle } from "@/lib/actions/vehicles";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
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

type Vehicle = {
  _id: string;
  plateOrBodyNumber: string;
  vehicleType: string;
  color: string;
  model: string;
  operatorId?: { _id: string; fullName: string } | null;
};

export function VehiclesView({
  vehicles,
  operatorOptions,
  canManage,
}: {
  vehicles: Vehicle[];
  operatorOptions: ComboboxOption[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [, startTransition] = useTransition();

  const filtered = vehicles.filter((v) =>
    `${v.plateOrBodyNumber} ${v.model} ${v.color}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Vehicle
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bike}
          title="No vehicles found"
          description="Register a new vehicle to get started."
          actionLabel={canManage ? "New Vehicle" : undefined}
          onAction={canManage ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate/Body No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model / Color</TableHead>
                <TableHead>Operator</TableHead>
                {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((vehicle) => (
                <TableRow key={vehicle._id}>
                  <TableCell className="font-medium">
                    <Link href={`/vehicles/${vehicle._id}`} className="hover:underline">
                      {vehicle.plateOrBodyNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {vehicle.vehicleType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.model} · {vehicle.color}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {vehicle.operatorId?.fullName ?? "—"}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(vehicle)}>
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Archive className="size-4" />
                            </Button>
                          }
                          title="Archive vehicle?"
                          description={`${vehicle.plateOrBodyNumber} will be hidden from active lists.`}
                          confirmLabel="Archive"
                          successMessage="Vehicle archived."
                          onConfirm={() => archiveVehicle(vehicle._id)}
                        />
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
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm
            operatorOptions={operatorOptions}
            onSuccess={() => startTransition(() => setCreateOpen(false))}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editing ? (
            <VehicleForm
              vehicleId={editing._id}
              defaultValues={{
                ...editing,
                vehicleType: editing.vehicleType as "tricycle" | "habal-habal/motorcycle" | "other",
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
