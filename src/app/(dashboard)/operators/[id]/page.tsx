import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { UserRound, Bike, FileBadge } from "lucide-react";
import { getOperator } from "@/lib/actions/operators";
import { listDrivers } from "@/lib/actions/drivers";
import { listVehicles } from "@/lib/actions/vehicles";
import { listFranchises } from "@/lib/actions/franchises";
import type { FranchiseStatus } from "@/lib/models/Franchise";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function OperatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const operator = await getOperator(id);
  if (!operator) notFound();

  const [drivers, vehicles, franchises] = await Promise.all([
    listDrivers(false, id),
    listVehicles(false, id),
    listFranchises({ operatorId: id }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{operator.fullName}</h1>
        <p className="text-sm text-muted-foreground">
          Registered {format(new Date(operator.dateRegistered), "MMM d, yyyy")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operator details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{operator.address}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact number</p>
            <p className="font-medium">{operator.contactNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{operator.email || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Drivers ({drivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <EmptyState icon={UserRound} title="No drivers linked" description="No drivers are linked to this operator yet." />
          ) : (
            <ul className="divide-y divide-border">
              {drivers.map((d: { _id: string; fullName: string; driversLicenseNumber: string }) => (
                <li key={d._id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/drivers/${d._id}`} className="font-medium hover:underline">
                    {d.fullName}
                  </Link>
                  <span className="text-muted-foreground">{d.driversLicenseNumber}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicles ({vehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <EmptyState icon={Bike} title="No vehicles linked" description="No vehicles are linked to this operator yet." />
          ) : (
            <ul className="divide-y divide-border">
              {vehicles.map((v: { _id: string; plateOrBodyNumber: string; vehicleType: string }) => (
                <li key={v._id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/vehicles/${v._id}`} className="font-medium hover:underline">
                    {v.plateOrBodyNumber}
                  </Link>
                  <span className="text-muted-foreground capitalize">{v.vehicleType}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Franchises ({franchises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {franchises.length === 0 ? (
            <EmptyState icon={FileBadge} title="No franchises issued" description="No franchises have been issued to this operator yet." />
          ) : (
            <ul className="divide-y divide-border">
              {franchises.map((f: { _id: string; franchiseNumber: string; status: FranchiseStatus }) => (
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
      <Separator className="opacity-0" />
    </div>
  );
}
