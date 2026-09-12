import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDrivers } from "@/lib/actions/drivers";
import { listOperators } from "@/lib/actions/operators";
import { DriversView } from "@/components/drivers/drivers-view";

export default async function DriversPage() {
  const session = await getServerSession(authOptions);
  const [drivers, operators] = await Promise.all([listDrivers(), listOperators()]);
  const canManage = session?.user.role !== "enforcement_officer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Drivers</h1>
        <p className="text-sm text-muted-foreground">
          Registered tricycle and habal-habal drivers in Midsalip.
        </p>
      </div>
      <DriversView
        drivers={drivers}
        operatorOptions={operators.map((o: { _id: string; fullName: string }) => ({
          value: o._id,
          label: o.fullName,
        }))}
        canManage={canManage}
      />
    </div>
  );
}
