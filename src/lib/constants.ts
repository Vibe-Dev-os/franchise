// Plain enum constants shared by both server (models) and client components.
// Kept free of any server-only imports (e.g. mongoose) so client bundles
// that need these values don't accidentally pull in server-only code.

export const USER_ROLES = ["admin", "franchising_officer", "enforcement_officer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VEHICLE_TYPES = ["tricycle", "habal-habal/motorcycle", "other"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const FRANCHISE_STATUSES = [
  "active",
  "expiring_soon",
  "expired",
  "suspended",
  "revoked",
] as const;
export type FranchiseStatus = (typeof FRANCHISE_STATUSES)[number];

export const VIOLATION_TYPES = [
  "unregistered",
  "expired_franchise",
  "suspended_franchise",
  "other",
] as const;
export type ViolationType = (typeof VIOLATION_TYPES)[number];

export const VIOLATION_STATUSES = ["recorded", "paid", "contested", "waived"] as const;
export type ViolationStatus = (typeof VIOLATION_STATUSES)[number];

export const INSPECTION_RESULTS = [
  "valid_franchise",
  "expired",
  "not_found_unregistered",
  "suspended",
] as const;
export type InspectionResult = (typeof INSPECTION_RESULTS)[number];
