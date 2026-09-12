import { z } from "zod";

export const driverSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  address: z.string().min(2, "Address is required."),
  contactNumber: z.string().min(7, "Enter a valid contact number."),
  driversLicenseNumber: z.string().min(3, "License number is required."),
  licenseExpiry: z.coerce.date(),
  photoUrl: z.string().optional().or(z.literal("")),
  operatorId: z.string().optional().or(z.literal("")),
});

export type DriverInput = z.infer<typeof driverSchema>;
