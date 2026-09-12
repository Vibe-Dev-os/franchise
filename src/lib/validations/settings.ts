import { z } from "zod";
import { USER_ROLES } from "@/lib/constants";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(USER_ROLES),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(USER_ROLES),
});

export const configSchema = z.object({
  feeSchedule: z.object({
    tricycle: z.coerce.number().min(0),
    "habal-habal/motorcycle": z.coerce.number().min(0),
    other: z.coerce.number().min(0),
  }),
  zones: z.array(z.string().min(1)).min(1, "At least one zone is required."),
});
