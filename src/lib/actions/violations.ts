"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Violation } from "@/lib/models/Violation";
import { InspectionLog } from "@/lib/models/InspectionLog";
import { requireRole, requireSession } from "@/lib/auth-helpers";
import {
  violationSchema,
  violationStatusSchema,
  lookupSchema,
} from "@/lib/validations/violation";
import { findFranchiseByPlateOrNumber } from "@/lib/actions/franchises";
import { type ActionResult, errorMessage, serialize } from "@/lib/actions/utils";
import type { InspectionResult } from "@/lib/models/InspectionLog";
import type { SerializedFranchise } from "@/lib/actions/franchises";

export type LookupResult = {
  result: InspectionResult;
  franchise: SerializedFranchise | null;
  query: string;
};

/**
 * Looks up a plate/franchise number, always logging the attempt to
 * InspectionLog for a full audit trail, regardless of outcome.
 */
export async function quickLookup(input: unknown): Promise<ActionResult<LookupResult>> {
  try {
    const session = await requireRole("admin", "enforcement_officer");
    const { query } = lookupSchema.parse(input);
    await connectDB();

    const franchise = await findFranchiseByPlateOrNumber(query);

    let result: InspectionResult;
    if (!franchise) {
      result = "not_found_unregistered";
    } else if (franchise.status === "expired") {
      result = "expired";
    } else if (franchise.status === "suspended" || franchise.status === "revoked") {
      result = "suspended";
    } else {
      result = "valid_franchise";
    }

    await InspectionLog.create({
      searchedValue: query,
      result,
      officerId: session.user.id,
      timestamp: new Date(),
      linkedFranchiseId: franchise?._id ?? null,
    });

    revalidatePath("/enforcement");
    return { success: true, data: { result, franchise, query } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function listRecentInspections(limit = 10) {
  const session = await requireSession();
  await connectDB();
  const logs = await InspectionLog.find({ officerId: session.user.id })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  return serialize(logs);
}

export async function logViolation(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireRole("admin", "enforcement_officer");
    const parsed = violationSchema.parse(input);
    await connectDB();

    const violation = await Violation.create({
      relatedFranchiseId: parsed.relatedFranchiseId || null,
      plateOrBodyNumberChecked: parsed.plateOrBodyNumberChecked,
      violationType: parsed.violationType,
      description: parsed.description || "",
      location: parsed.location,
      officerId: session.user.id,
      dateRecorded: new Date(),
      fineAmount: parsed.fineAmount,
      status: "recorded",
    });

    revalidatePath("/violations");
    revalidatePath("/dashboard");
    return { success: true, data: { id: violation._id.toString() } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function listViolations() {
  await connectDB();
  const violations = await Violation.find({})
    .populate("officerId", "name")
    .populate("relatedFranchiseId", "franchiseNumber")
    .sort({ dateRecorded: -1 })
    .lean();
  return serialize(violations);
}

export async function getViolation(id: string) {
  await connectDB();
  const violation = await Violation.findById(id)
    .populate("officerId", "name")
    .populate("relatedFranchiseId", "franchiseNumber")
    .lean();
  return violation ? serialize(violation) : null;
}

export async function updateViolationStatus(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = violationStatusSchema.parse(input);
    await connectDB();
    await Violation.findByIdAndUpdate(parsed.violationId, { status: parsed.status });
    revalidatePath("/violations");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
