import {
  getFranchiseRegistryReport,
  getComplianceReport,
  getRevenueReport,
  getViolationsReport,
} from "@/lib/actions/reports";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const [registry, compliance, revenue, violationsReport] = await Promise.all([
    getFranchiseRegistryReport(),
    getComplianceReport(),
    getRevenueReport(),
    getViolationsReport(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Franchise registry, compliance, revenue, and violations reporting.
        </p>
      </div>
      <ReportsView
        registry={registry}
        compliance={compliance}
        revenue={revenue}
        violationsReport={violationsReport}
      />
    </div>
  );
}
