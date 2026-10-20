"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/Vehicle";
import { requireRole } from "@/lib/auth-helpers";
import { vehicleSchema } from "@/lib/validations/vehicle";
import { type ActionResult, errorMessage, serialize } from "@/lib/actions/utils";

export async function listVehicles(includeArchived = false, operatorId?: string) {
  await connectDB();
  const query: Record<string, unknown> = includeArchived ? {} : { archived: { $ne: true } };
  if (operatorId) query.operatorId = operatorId;
  const vehicles = await Vehicle.find(query)
    .populate("operatorId", "fullName")
    .sort({ plateOrBodyNumber: 1 })
    .lean();
  return serialize(vehicles);
}

export async function getVehicle(id: string) {
  await connectDB();
  const vehicle = await Vehicle.findById(id).populate("operatorId", "fullName").lean();
  return vehicle ? serialize(vehicle) : null;
}

export async function createVehicle(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = vehicleSchema.parse(input);
    await connectDB();

    const existing = await Vehicle.findOne({
      plateOrBodyNumber: parsed.plateOrBodyNumber.toUpperCase(),
      archived: { $ne: true },
    }).lean();
    if (existing) {
      return {
        success: false,
        error: `Plate/body number "${parsed.plateOrBodyNumber.toUpperCase()}" is already registered to another vehicle.`,
      };
    }

    const vehicle = await Vehicle.create(parsed);
    revalidatePath("/vehicles");
    return { success: true, data: { id: vehicle._id.toString() } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function updateVehicle(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = vehicleSchema.parse(input);
    await connectDB();

    const existing = await Vehicle.findOne({
      plateOrBodyNumber: parsed.plateOrBodyNumber.toUpperCase(),
      archived: { $ne: true },
      _id: { $ne: id },
    }).lean();
    if (existing) {
      return {
        success: false,
        error: `Plate/body number "${parsed.plateOrBodyNumber.toUpperCase()}" is already used by another vehicle.`,
      };
    }

    await Vehicle.findByIdAndUpdate(id, parsed);
    revalidatePath("/vehicles");
    revalidatePath(`/vehicles/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function archiveVehicle(id: string): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    await connectDB();
    await Vehicle.findByIdAndUpdate(id, { archived: true });
    revalidatePath("/vehicles");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
