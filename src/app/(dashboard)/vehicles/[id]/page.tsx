import Link from "next/link";
import { notFound } from "next/navigation";
import { FileBadge } from "lucide-react";
import { getVehicle } from "@/lib/actions/vehicles";
import { listFranchises } from "@/lib/actions/franchises";
import type { FranchiseStatus } from "@/lib/models/Franchise";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  const franchises = await listFranchises({});
  const linkedFranchises = franchises.filter(
    (f: { vehicleId?: { _id: string } | null }) => f.vehicleId?._id === id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{vehicle.plateOrBodyNumber}</h1>
        <Badge variant="secondary" className="capitalize">
          {vehicle.vehicleType}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Model / Color</p>
            <p className="font-medium">{vehicle.model} · {vehicle.color}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Engine number</p>
            <p className="font-medium">{vehicle.engineNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Chassis number</p>
            <p className="font-medium">{vehicle.chassisNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Operator</p>
            <p className="font-medium">
              {vehicle.operatorId ? (
                <Link href={`/operators/${vehicle.operatorId._id}`} className="hover:underline">
                  {vehicle.operatorId.fullName}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Franchises ({linkedFranchises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {linkedFranchises.length === 0 ? (
            <EmptyState
              icon={FileBadge}
              title="No franchises issued"
              description="No franchises have been issued for this vehicle yet."
            />
          ) : (
            <ul className="divide-y divide-border">
              {linkedFranchises.map((f: { _id: string; franchiseNumber: string; status: FranchiseStatus }) => (
                <li key={f._id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/franchises/${f._id}`} className="font-medium hover:underline">
                    {f.franchiseNumber}
                  </Link>
                  <StatusBadge status={f.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
