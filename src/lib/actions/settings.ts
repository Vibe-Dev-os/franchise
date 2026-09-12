"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Config } from "@/lib/models/Config";
import { requireRole } from "@/lib/auth-helpers";
import { createUserSchema, updateUserRoleSchema, configSchema } from "@/lib/validations/settings";
import { type ActionResult, errorMessage, serialize } from "@/lib/actions/utils";

export async function listUsers() {
  await requireRole("admin");
  await connectDB();
  const users = await User.find({}).select("-passwordHash").sort({ name: 1 }).lean();
  return serialize(users);
}

export async function createUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("admin");
    const parsed = createUserSchema.parse(input);
    await connectDB();

    const existing = await User.findOne({ email: parsed.email.toLowerCase() });
    if (existing) throw new Error("A user with this email already exists.");

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      passwordHash,
      role: parsed.role,
      active: true,
    });

    revalidatePath("/settings");
    return { success: true, data: { id: user._id.toString() } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function updateUserRole(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = updateUserRoleSchema.parse(input);
    await connectDB();
    await User.findByIdAndUpdate(parsed.userId, { role: parsed.role });
    revalidatePath("/settings");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function toggleUserActive(userId: string, active: boolean): Promise<ActionResult> {
  try {
    await requireRole("admin");
    await connectDB();
    await User.findByIdAndUpdate(userId, { active });
    revalidatePath("/settings");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function getConfig() {
  await connectDB();
  let config = await Config.findOne({ key: "franchise_config" }).lean();
  if (!config) {
    const created = await Config.create({ key: "franchise_config" });
    config = created.toObject();
  }
  return serialize(config);
}

export async function updateConfig(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin");
    const parsed = configSchema.parse(input);
    await connectDB();
    await Config.findOneAndUpdate(
      { key: "franchise_config" },
      { feeSchedule: parsed.feeSchedule, zones: parsed.zones },
      { upsert: true }
    );
    revalidatePath("/settings");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
