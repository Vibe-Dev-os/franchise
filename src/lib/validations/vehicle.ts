import { z } from "zod";
import { VEHICLE_TYPES } from "@/lib/constants";

export const vehicleSchema = z.object({
  plateOrBodyNumber: z.string().min(1, "Plate/body number is required."),
  vehicleType: z.enum(VEHICLE_TYPES),
  engineNumber: z.string().min(1, "Engine number is required."),
  chassisNumber: z.string().min(1, "Chassis number is required."),
  color: z.string().min(1, "Color is required."),
  model: z.string().min(1, "Model is required."),
  operatorId: z.string().min(1, "Operator is required."),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
