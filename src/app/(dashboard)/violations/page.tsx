import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listViolations } from "@/lib/actions/violations";
import { ViolationsView } from "@/components/violations/violations-view";

export default async function ViolationsPage() {
  const session = await getServerSession(authOptions);
  const violations = await listViolations();
  const canUpdateStatus =
    session?.user.role === "admin" || session?.user.role === "franchising_officer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Violations</h1>
        <p className="text-sm text-muted-foreground">
          Violations logged by enforcement officers across Midsalip.
        </p>
      </div>
      <ViolationsView violations={violations} canUpdateStatus={canUpdateStatus} />
    </div>
  );
}
