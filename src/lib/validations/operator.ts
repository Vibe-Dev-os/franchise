import { z } from "zod";

export const operatorSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  address: z.string().min(2, "Address is required."),
  contactNumber: z.string().min(7, "Enter a valid contact number."),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  dateRegistered: z.coerce.date(),
});

export type OperatorInput = z.infer<typeof operatorSchema>;
