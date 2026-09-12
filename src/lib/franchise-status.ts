import { differenceInCalendarDays } from "date-fns";
import type { FranchiseStatus } from "@/lib/models/Franchise";

const EXPIRING_SOON_WINDOW_DAYS = 30;

/**
 * Derives the display status from expiryDate, unless the franchise has been
 * manually suspended/revoked which always takes precedence.
 */
export function computeFranchiseStatus(
  expiryDate: Date | string,
  manualStatus?: FranchiseStatus
): FranchiseStatus {
  if (manualStatus === "suspended" || manualStatus === "revoked") {
    return manualStatus;
  }

  const days = differenceInCalendarDays(new Date(expiryDate), new Date());

  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_WINDOW_DAYS) return "expiring_soon";
  return "active";
}

export const STATUS_BADGE_VARIANT: Record<
  FranchiseStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-status-active/15 text-status-active border-status-active/30",
  },
  expiring_soon: {
    label: "Expiring Soon",
    className: "bg-status-expiring/15 text-status-expiring border-status-expiring/30",
  },
  expired: {
    label: "Expired",
    className: "bg-status-expired/15 text-status-expired border-status-expired/30",
  },
  suspended: {
    label: "Suspended",
    className: "bg-status-suspended/15 text-status-suspended border-status-suspended/30",
  },
  revoked: {
    label: "Revoked",
    className: "bg-status-expired/15 text-status-expired border-status-expired/30",
  },
};
