import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listRecentInspections } from "@/lib/actions/violations";
import { EnforcementView } from "@/components/enforcement/enforcement-view";

export default async function EnforcementPage() {
  const session = await getServerSession(authOptions);
  const inspections = await listRecentInspections(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enforcement — Quick Lookup</h1>
        <p className="text-sm text-muted-foreground">
          Check if a vehicle or franchise number is registered and compliant.
        </p>
      </div>
      <EnforcementView
        officerName={session?.user.name ?? "Officer"}
        initialInspections={inspections}
      />
    </div>
  );
}
