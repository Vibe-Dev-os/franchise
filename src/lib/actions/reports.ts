"use server";

import { connectDB } from "@/lib/db";
import { Franchise } from "@/lib/models/Franchise";
import { Violation } from "@/lib/models/Violation";
import { requireRole } from "@/lib/auth-helpers";
import { serialize, errorMessage, type ActionResult } from "@/lib/actions/utils";
import { computeFranchiseStatus } from "@/lib/franchise-status";

const POPULATE = [
  { path: "driverId", select: "fullName" },
  { path: "vehicleId", select: "plateOrBodyNumber vehicleType" },
  { path: "operatorId", select: "fullName" },
];

export async function getFranchiseRegistryReport() {
  await requireRole("admin", "franchising_officer");
  await connectDB();
  const docs = await Franchise.find({}).populate(POPULATE).sort({ franchiseNumber: 1 }).lean();
  return serialize(
    docs.map((d) => ({ ...d, status: computeFranchiseStatus(d.expiryDate, d.status) }))
  );
}

export async function getComplianceReport() {
  await requireRole("admin", "franchising_officer");
  await connectDB();

  const franchises = await Franchise.find({}).select("routeOrZone expiryDate status").lean();
  const violations = await Violation.find({ violationType: "unregistered" })
    .select("location")
    .lean();

  const byZone = new Map<
    string,
    { zone: string; active: number; expired: number; unregisteredCaught: number }
  >();

  for (const f of franchises) {
    const zone = f.routeOrZone || "Unspecified";
    if (!byZone.has(zone)) byZone.set(zone, { zone, active: 0, expired: 0, unregisteredCaught: 0 });
    const entry = byZone.get(zone)!;
    const status = computeFranchiseStatus(f.expiryDate, f.status);
    if (status === "expired") entry.expired++;
    else entry.active++;
  }

  for (const v of violations) {
    const zone = v.location || "Unspecified";
    if (!byZone.has(zone)) byZone.set(zone, { zone, active: 0, expired: 0, unregisteredCaught: 0 });
    byZone.get(zone)!.unregisteredCaught++;
  }

  return serialize(Array.from(byZone.values()).sort((a, b) => a.zone.localeCompare(b.zone)));
}

export async function getRevenueReport() {
  await requireRole("admin", "franchising_officer");
  await connectDB();

  const franchises = await Franchise.find({ feePaid: true })
    .select("feeAmount dateIssued")
    .lean();

  const byMonth = new Map<string, number>();
  for (const f of franchises) {
    const key = new Date(f.dateIssued).toISOString().slice(0, 7);
    byMonth.set(key, (byMonth.get(key) || 0) + (f.feeAmount || 0));
  }

  const rows = Array.from(byMonth.entries())
    .map(([period, total]) => ({ period, total }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

  return serialize({ rows, grandTotal });
}

export async function getViolationsReport() {
  await requireRole("admin", "franchising_officer");
  await connectDB();

  const violations = await Violation.find({}).populate("officerId", "name").lean();

  const byType = new Map<string, number>();
  const byOfficer = new Map<string, number>();
  const byStatus = new Map<string, number>();

  for (const v of violations) {
    byType.set(v.violationType, (byType.get(v.violationType) || 0) + 1);
    const officerName = (v.officerId as { name?: string } | null)?.name ?? "Unknown";
    byOfficer.set(officerName, (byOfficer.get(officerName) || 0) + 1);
    byStatus.set(v.status ?? "recorded", (byStatus.get(v.status ?? "recorded") || 0) + 1);
  }

  return serialize({
    byType: Array.from(byType.entries()).map(([type, count]) => ({ type, count })),
    byOfficer: Array.from(byOfficer.entries()).map(([officer, count]) => ({ officer, count })),
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })),
    total: violations.length,
  });
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function exportReportCsv(
  reportType: "registry" | "compliance" | "revenue" | "violations"
): Promise<ActionResult<{ csv: string; filename: string }>> {
  try {
    await requireRole("admin", "franchising_officer");

    if (reportType === "registry") {
      const data = await getFranchiseRegistryReport();
      const rows = data.map((d: Record<string, unknown>) => ({
        franchiseNumber: d.franchiseNumber,
        driver: (d.driverId as { fullName?: string } | null)?.fullName ?? "",
        vehicle: (d.vehicleId as { plateOrBodyNumber?: string } | null)?.plateOrBodyNumber ?? "",
        operator: (d.operatorId as { fullName?: string } | null)?.fullName ?? "",
        routeOrZone: d.routeOrZone,
        status: d.status,
        expiryDate: d.expiryDate,
      }));
      return { success: true, data: { csv: toCsv(rows), filename: "franchise-registry.csv" } };
    }

    if (reportType === "compliance") {
      const rows = await getComplianceReport();
      return { success: true, data: { csv: toCsv(rows), filename: "compliance-report.csv" } };
    }

    if (reportType === "revenue") {
      const { rows } = await getRevenueReport();
      return { success: true, data: { csv: toCsv(rows), filename: "revenue-report.csv" } };
    }

    const { byType } = await getViolationsReport();
    return { success: true, data: { csv: toCsv(byType), filename: "violations-report.csv" } };
  } catch (err) {
    return { success: false, error: errorMessage(err) };
  }
}
