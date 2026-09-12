"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCcw, ShieldOff, Ban } from "lucide-react";
import { setFranchiseStatus } from "@/lib/actions/franchises";
import { RenewFranchiseDialog } from "@/components/franchises/renew-franchise-dialog";
import { Button } from "@/components/ui/button";
import type { FranchiseStatus } from "@/lib/models/Franchise";

export function FranchiseDetailActions({
  franchise,
}: {
  franchise: { _id: string; franchiseNumber: string; expiryDate: string; status: FranchiseStatus };
}) {
  const [renewOpen, setRenewOpen] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSetStatus(status: "suspended" | "revoked" | "active") {
    const result = await setFranchiseStatus(franchise._id, status);
    if (result.success) {
      toast.success(`Franchise ${status}.`);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setRenewOpen(true)}>
        <RefreshCcw className="size-4" />
        Renew
      </Button>
      {franchise.status !== "suspended" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => handleSetStatus("suspended"))}
        >
          <ShieldOff className="size-4" />
          Suspend
        </Button>
      ) : null}
      {franchise.status !== "revoked" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => handleSetStatus("revoked"))}
        >
          <Ban className="size-4" />
          Revoke
        </Button>
      ) : null}
      {(franchise.status === "suspended" || franchise.status === "revoked") ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => startTransition(() => handleSetStatus("active"))}
        >
          <RefreshCcw className="size-4" />
          Reinstate
        </Button>
      ) : null}

      <RenewFranchiseDialog franchise={franchise} open={renewOpen} onOpenChange={setRenewOpen} />
    </div>
  );
}
