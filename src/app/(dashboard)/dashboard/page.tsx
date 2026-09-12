import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminDashboardData, getEnforcementDashboardData } from "@/lib/actions/dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ClipboardCheck, ShieldAlert, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;

  if (role === "enforcement_officer") {
    const data = await getEnforcementDashboardData();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enforcement Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user.name}. Here&apos;s your activity summary.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="My Inspections Today"
            value={data.kpis.myInspectionsToday}
            icon={Search}
          />
          <KpiCard
            label="Violations Logged Today"
            value={data.kpis.violationsLoggedToday}
            icon={ClipboardCheck}
            accent="amber"
          />
          <KpiCard
            label="Violations This Month"
            value={data.kpis.violationsLoggedThisMonth}
            icon={ShieldAlert}
            accent="amber"
          />
          <KpiCard
            label="Unregistered Cases (Month)"
            value={data.kpis.unregisteredCasesThisMonth}
            icon={AlertTriangle}
            accent="red"
          />
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <Search className="size-7" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Quick Lookup</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Check whether a vehicle or franchise number is registered and compliant.
              </p>
            </div>
            <Button size="lg" nativeButton={false} render={<Link href="/enforcement" />}>
              Go to Enforcement Lookup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of franchise compliance across Midsalip.
        </p>
      </div>
      <AdminDashboard data={data} />
    </div>
  );
}
