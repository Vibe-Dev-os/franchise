import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listFranchises } from "@/lib/actions/franchises";
import { listOperators } from "@/lib/actions/operators";
import { listDrivers } from "@/lib/actions/drivers";
import { listVehicles } from "@/lib/actions/vehicles";
import { getConfig } from "@/lib/actions/settings";
import { FranchisesView } from "@/components/franchises/franchises-view";

export default async function FranchisesPage() {
  const session = await getServerSession(authOptions);
  const [franchises, operators, drivers, vehicles, config] = await Promise.all([
    listFranchises(),
    listOperators(),
    listDrivers(),
    listVehicles(),
    getConfig(),
  ]);
  const canManage = session?.user.role === "admin" || session?.user.role === "franchising_officer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Franchises</h1>
        <p className="text-sm text-muted-foreground">
          Issued franchises for tricycle and habal-habal operators in Midsalip.
        </p>
      </div>
      <FranchisesView
        franchises={franchises}
        operators={operators.map((o: { _id: string; fullName: string }) => ({
          _id: o._id,
          fullName: o.fullName,
        }))}
        drivers={drivers.map(
          (d: { _id: string; fullName: string; operatorId?: { _id: string } | null }) => ({
            _id: d._id,
            fullName: d.fullName,
            operatorId: d.operatorId?._id ?? null,
          })
        )}
        vehicles={vehicles.map(
          (v: {
            _id: string;
            plateOrBodyNumber: string;
            vehicleType: string;
            operatorId?: { _id: string } | null;
          }) => ({
            _id: v._id,
            plateOrBodyNumber: v.plateOrBodyNumber,
            vehicleType: v.vehicleType,
            operatorId: v.operatorId?._id ?? null,
          })
        )}
        zones={config.zones}
        canManage={canManage}
      />
    </div>
  );
}
