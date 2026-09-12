"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Users, Pencil, Archive, Search } from "lucide-react";
import { toast } from "sonner";
import { archiveOperator } from "@/lib/actions/operators";
import { OperatorForm } from "@/components/operators/operator-form";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

type Operator = {
  _id: string;
  fullName: string;
  address: string;
  contactNumber: string;
  email?: string;
  dateRegistered: string;
};

export function OperatorsView({
  operators,
  canManage,
}: {
  operators: Operator[];
  canManage: boolean;
}) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Operator | null>(null);
  const [, startTransition] = useTransition();

  const filtered = operators.filter((o) =>
    `${o.fullName} ${o.address} ${o.contactNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search operators..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Operator
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No operators found"
          description="Register a new tricycle/habal-habal operator to get started."
          actionLabel={canManage ? "New Operator" : undefined}
          onAction={canManage ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registered</TableHead>
                {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((operator) => (
                <TableRow key={operator._id}>
                  <TableCell className="font-medium">
                    <Link href={`/operators/${operator._id}`} className="hover:underline">
                      {operator.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{operator.address}</TableCell>
                  <TableCell>{operator.contactNumber}</TableCell>
                  <TableCell>{format(new Date(operator.dateRegistered), "MMM d, yyyy")}</TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(operator)}>
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm">
                              <Archive className="size-4" />
                            </Button>
                          }
                          title="Archive operator?"
                          description={`${operator.fullName} will be hidden from active lists. This can be reversed later in the database.`}
                          confirmLabel="Archive"
                          successMessage="Operator archived."
                          onConfirm={() => archiveOperator(operator._id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Operator</DialogTitle>
          </DialogHeader>
          <OperatorForm onSuccess={() => startTransition(() => setCreateOpen(false))} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Operator</DialogTitle>
          </DialogHeader>
          {editing ? (
            <OperatorForm
              operatorId={editing._id}
              defaultValues={{ ...editing, dateRegistered: new Date(editing.dateRegistered) }}
              onSuccess={() => startTransition(() => setEditing(null))}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
