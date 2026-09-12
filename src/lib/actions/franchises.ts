"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Franchise } from "@/lib/models/Franchise";
import { nextSequence } from "@/lib/models/Counter";
import { requireRole } from "@/lib/auth-helpers";
import { franchiseSchema, renewFranchiseSchema } from "@/lib/validations/franchise";
import { computeFranchiseStatus } from "@/lib/franchise-status";
import { type ActionResult, errorMessage, serialize } from "@/lib/actions/utils";
import type { FranchiseStatus } from "@/lib/models/Franchise";

const POPULATE = [
  { path: "driverId", select: "fullName driversLicenseNumber" },
  { path: "vehicleId", select: "plateOrBodyNumber vehicleType" },
  { path: "operatorId", select: "fullName" },
];

export type FranchiseListFilter = {
  status?: FranchiseStatus | "all";
  vehicleType?: string;
  routeOrZone?: string;
  expiringWithinDays?: number;
  operatorId?: string;
};

export type SerializedFranchise = Record<string, unknown> & {
  _id: string;
  franchiseNumber: string;
  expiryDate: string;
  status: FranchiseStatus;
};

async function withComputedStatuses(docs: Record<string, unknown>[]) {
  return docs.map((doc) => ({
    ...doc,
    status: computeFranchiseStatus(
      doc.expiryDate as string,
      doc.status as FranchiseStatus
    ),
  }));
}

export async function listFranchises(filter: FranchiseListFilter = {}) {
  await connectDB();
  const query: Record<string, unknown> = {};

  if (filter.routeOrZone) query.routeOrZone = filter.routeOrZone;
  if (filter.operatorId) query.operatorId = filter.operatorId;

  let docs = await Franchise.find(query).populate(POPULATE).sort({ createdAt: -1 }).lean();
  docs = await withComputedStatuses(docs as Record<string, unknown>[]) as typeof docs;

  if (filter.vehicleType) {
    docs = docs.filter(
      (d) => (d.vehicleId as { vehicleType?: string } | null)?.vehicleType === filter.vehicleType
    );
  }

  if (filter.status && filter.status !== "all") {
    docs = docs.filter((d) => d.status === filter.status);
  }

  if (filter.expiringWithinDays != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + filter.expiringWithinDays);
    docs = docs.filter(
      (d) => new Date(d.expiryDate as unknown as string) <= cutoff && d.status !== "expired"
    );
  }

  return serialize(docs);
}

export async function getFranchise(id: string): Promise<SerializedFranchise | null> {
  await connectDB();
  const doc = await Franchise.findById(id)
    .populate(POPULATE)
    .populate("renewalHistory.renewedBy", "name")
    .lean();
  if (!doc) return null;
  const [withStatus] = await withComputedStatuses([doc as Record<string, unknown>]);
  return serialize(withStatus) as SerializedFranchise;
}

export async function findFranchiseByPlateOrNumber(query: string): Promise<SerializedFranchise | null> {
  await connectDB();
  const trimmed = query.trim();
  if (!trimmed) return null;

  const byNumber = await Franchise.findOne({
    franchiseNumber: new RegExp(`^${trimmed}$`, "i"),
  })
    .populate(POPULATE)
    .lean();
  if (byNumber) {
    const [withStatus] = await withComputedStatuses([byNumber as Record<string, unknown>]);
    return serialize(withStatus) as SerializedFranchise;
  }

  const franchises = await Franchise.find({}).populate(POPULATE).lean();
  const match = franchises.find(
    (f) =>
      (f.vehicleId as { plateOrBodyNumber?: string } | null)?.plateOrBodyNumber?.toUpperCase() ===
      trimmed.toUpperCase()
  );
  if (!match) return null;
  const [withStatus] = await withComputedStatuses([match as Record<string, unknown>]);
  return serialize(withStatus) as SerializedFranchise;
}

async function generateFranchiseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`franchise-${year}`);
  return `MSP-FR-${year}-${String(seq).padStart(4, "0")}`;
}

export async function createFranchise(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = franchiseSchema.parse(input);
    await connectDB();
    const franchiseNumber = await generateFranchiseNumber();
    const status = computeFranchiseStatus(parsed.expiryDate);
    const franchise = await Franchise.create({ ...parsed, franchiseNumber, status });
    revalidatePath("/franchises");
    return { success: true, data: { id: franchise._id.toString() } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function updateFranchise(id: string, input: unknown): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    const parsed = franchiseSchema.parse(input);
    await connectDB();
    const status = computeFranchiseStatus(parsed.expiryDate);
    await Franchise.findByIdAndUpdate(id, { ...parsed, status });
    revalidatePath("/franchises");
    revalidatePath(`/franchises/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function setFranchiseStatus(
  id: string,
  status: Extract<FranchiseStatus, "suspended" | "revoked" | "active">
): Promise<ActionResult> {
  try {
    await requireRole("admin", "franchising_officer");
    await connectDB();
    await Franchise.findByIdAndUpdate(id, { status });
    revalidatePath("/franchises");
    revalidatePath(`/franchises/${id}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}

export async function renewFranchise(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole("admin", "franchising_officer");
    const parsed = renewFranchiseSchema.parse(input);
    await connectDB();

    const franchise = await Franchise.findById(parsed.franchiseId);
    if (!franchise) throw new Error("Franchise not found.");

    const previousExpiryDate = franchise.expiryDate;
    franchise.expiryDate = parsed.newExpiryDate;
    franchise.status = computeFranchiseStatus(parsed.newExpiryDate);
    franchise.renewalHistory.push({
      renewedAt: new Date(),
      renewedBy: session.user.id,
      previousExpiryDate,
      newExpiryDate: parsed.newExpiryDate,
    });
    await franchise.save();

    revalidatePath("/franchises");
    revalidatePath(`/franchises/${parsed.franchiseId}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
