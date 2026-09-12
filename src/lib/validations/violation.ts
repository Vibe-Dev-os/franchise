import { z } from "zod";
import { VIOLATION_TYPES, VIOLATION_STATUSES } from "@/lib/constants";

export const violationSchema = z.object({
  relatedFranchiseId: z.string().optional().or(z.literal("")),
  plateOrBodyNumberChecked: z.string().min(1, "Plate/body number is required."),
  violationType: z.enum(VIOLATION_TYPES),
  description: z.string().optional().or(z.literal("")),
  location: z.string().min(1, "Location is required."),
  fineAmount: z.coerce.number().min(0, "Fine must be zero or more."),
});

export type ViolationInput = z.infer<typeof violationSchema>;

export const violationStatusSchema = z.object({
  violationId: z.string().min(1),
  status: z.enum(VIOLATION_STATUSES),
});

export const lookupSchema = z.object({
  query: z.string().min(1, "Enter a plate number or franchise number."),
});
