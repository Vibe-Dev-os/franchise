import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listVehicles } from "@/lib/actions/vehicles";
import { listOperators } from "@/lib/actions/operators";
import { VehiclesView } from "@/components/vehicles/vehicles-view";

export default async function VehiclesPage() {
  const session = await getServerSession(authOptions);
  const [vehicles, operators] = await Promise.all([listVehicles(), listOperators()]);
  const canManage = session?.user.role !== "enforcement_officer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
        <p className="text-sm text-muted-foreground">
          Registered tricycle and habal-habal vehicles in Midsalip.
        </p>
      </div>
      <VehiclesView
        vehicles={vehicles}
        operatorOptions={operators.map((o: { _id: string; fullName: string }) => ({
          value: o._id,
          label: o.fullName,
        }))}
        canManage={canManage}
      />
    </div>
  );
}
