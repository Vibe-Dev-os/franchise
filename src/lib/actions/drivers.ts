"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Driver } from "@/lib/models/Driver";
import { requireRole } from "@/lib/auth-helpers";
import { driverSchema } from "@/lib/validations/driver";
import { type ActionResult, errorMessage, serialize } from "@/lib/actions/utils";

export async function listDrivers(includeArchived = false, operatorId?: string) {
  await connectDB();
  const query: Record<string, unknown> = includeArchived ? {} : { archived: { $ne: true } };
  if (operatorId) query.operatorId = operatorId;
  const drivers = await Driver.find(query)
    .populate("operatorId", "fullName")
    .sort({ fullName: 1 })
    .lean();
  return serialize(drivers);
}

export async function getDriver(id: string) {
  await connectDB();
  const driver = await Driver.findById(id).populate("operatorId", "fullName").lean();
  return driver ? serialize(driver) : null;
}

function normalize(input: Record<string, unknown>) {
  return { ...input, operatorId: (input.operatorId as string) || null };
}

export async function createDriver(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = driverSchema.parse(input);
    await connectDB();
    const driver = await Driver.create(normalize(parsed));
    revalidatePath("/drivers");
    return { success: true, data: { id: driver._id.toString() } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function updateDriver(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = driverSchema.parse(input);
    await connectDB();
    await Driver.findByIdAndUpdate(id, normalize(parsed));
    revalidatePath("/drivers");
    revalidatePath(`/drivers/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function archiveDriver(id: string): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    await connectDB();
    await Driver.findByIdAndUpdate(id, { archived: true });
    revalidatePath("/drivers");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
