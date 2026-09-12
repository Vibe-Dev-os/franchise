"use server";

import { connectDB } from "@/lib/db";
import { Franchise } from "@/lib/models/Franchise";
import { Violation } from "@/lib/models/Violation";
import { InspectionLog } from "@/lib/models/InspectionLog";
import { requireSession } from "@/lib/auth-helpers";
import { serialize } from "@/lib/actions/utils";
import { computeFranchiseStatus } from "@/lib/franchise-status";
import { subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay, format } from "date-fns";

export async function getAdminDashboardData() {
  await connectDB();

  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const franchises = await Franchise.find({}).select("expiryDate status").lean();
  let active = 0;
  let expiringSoon = 0;
  let expired = 0;
  for (const f of franchises) {
    const status = computeFranchiseStatus(f.expiryDate, f.status);
    if (status === "active") active++;
    else if (status === "expiring_soon") expiringSoon++;
    else if (status === "expired") expired++;
  }

  const totalFranchises = franchises.length;

  const unregisteredViolationsThisMonth = await Violation.countDocuments({
    violationType: "unregistered",
    dateRecorded: { $gte: monthStart, $lte: monthEnd },
  });

  const statusDistribution = [
    { name: "Active", value: active, key: "active" },
    { name: "Expiring Soon", value: expiringSoon, key: "expiring_soon" },
    { name: "Expired", value: expired, key: "expired" },
  ];

  const sixMonthsAgo = startOfMonth(subMonths(now, 5));
  const violationsRaw = await Violation.find({
    dateRecorded: { $gte: sixMonthsAgo },
  })
    .select("dateRecorded")
    .lean();

  const monthBuckets: { month: string; violations: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    monthBuckets.push({ month: format(d, "MMM"), violations: 0 });
  }
  for (const v of violationsRaw) {
    const label = format(new Date(v.dateRecorded), "MMM");
    const bucket = monthBuckets.find((b) => b.month === label);
    if (bucket) bucket.violations++;
  }

  const expiringSoonList = await Franchise.find({
    expiryDate: { $gte: now, $lte: in30Days },
  })
    .populate("driverId", "fullName")
    .populate("vehicleId", "plateOrBodyNumber")
    .sort({ expiryDate: 1 })
    .limit(8)
    .lean();

  const recentViolations = await Violation.find({})
    .populate("officerId", "name")
    .sort({ dateRecorded: -1 })
    .limit(6)
    .lean();

  return serialize({
    kpis: {
      totalFranchises,
      active,
      expiringSoon,
      expired,
      unregisteredViolationsThisMonth,
    },
    statusDistribution,
    violationsOverTime: monthBuckets,
    expiringSoonList,
    recentViolations,
  });
}

export async function getEnforcementDashboardData() {
  const session = await requireSession();
  await connectDB();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const myInspectionsToday = await InspectionLog.countDocuments({
    officerId: session.user.id,
    timestamp: { $gte: todayStart, $lte: todayEnd },
  });

  const violationsLoggedToday = await Violation.countDocuments({
    officerId: session.user.id,
    dateRecorded: { $gte: todayStart, $lte: todayEnd },
  });

  const violationsLoggedThisMonth = await Violation.countDocuments({
    officerId: session.user.id,
    dateRecorded: { $gte: monthStart, $lte: monthEnd },
  });

  const unregisteredCasesThisMonth = await Violation.countDocuments({
    officerId: session.user.id,
    violationType: "unregistered",
    dateRecorded: { $gte: monthStart, $lte: monthEnd },
  });

  return serialize({
    kpis: {
      myInspectionsToday,
      violationsLoggedToday,
      violationsLoggedThisMonth,
      unregisteredCasesThisMonth,
    },
  });
}
