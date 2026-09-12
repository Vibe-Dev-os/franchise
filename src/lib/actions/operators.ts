"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Operator } from "@/lib/models/Operator";
import { requireRole } from "@/lib/auth-helpers";
import { operatorSchema } from "@/lib/validations/operator";
import { type ActionResult, errorMessage, serialize } from "@/lib/actions/utils";

export async function listOperators(includeArchived = false) {
  await connectDB();
  const operators = await Operator.find(includeArchived ? {} : { archived: { $ne: true } })
    .sort({ fullName: 1 })
    .lean();
  return serialize(operators);
}

export async function getOperator(id: string) {
  await connectDB();
  const operator = await Operator.findById(id).lean();
  return operator ? serialize(operator) : null;
}

export async function createOperator(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = operatorSchema.parse(input);
    await connectDB();
    const operator = await Operator.create(parsed);
    revalidatePath("/operators");
    return { success: true, data: { id: operator._id.toString() } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function updateOperator(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = operatorSchema.parse(input);
    await connectDB();
    await Operator.findByIdAndUpdate(id, parsed);
    revalidatePath("/operators");
    revalidatePath(`/operators/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function archiveOperator(id: string): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    await connectDB();
    await Operator.findByIdAndUpdate(id, { archived: true });
    revalidatePath("/operators");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
