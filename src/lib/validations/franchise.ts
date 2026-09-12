import { z } from "zod";

export const franchiseSchema = z.object({
  driverId: z.string().min(1, "Driver is required."),
  vehicleId: z.string().min(1, "Vehicle is required."),
  operatorId: z.string().min(1, "Operator is required."),
  routeOrZone: z.string().min(1, "Route/zone is required."),
  dateIssued: z.coerce.date(),
  expiryDate: z.coerce.date(),
  feeAmount: z.coerce.number().min(0, "Fee must be zero or more."),
  feePaid: z.coerce.boolean().default(false),
});

export type FranchiseInput = z.infer<typeof franchiseSchema>;

export const renewFranchiseSchema = z.object({
  franchiseId: z.string().min(1),
  newExpiryDate: z.coerce.date(),
});

export type RenewFranchiseInput = z.infer<typeof renewFranchiseSchema>;
