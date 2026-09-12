import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { FileBadge } from "lucide-react";
import { getDriver } from "@/lib/actions/drivers";
import { listFranchises } from "@/lib/actions/franchises";
import type { FranchiseStatus } from "@/lib/models/Franchise";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driver = await getDriver(id);
  if (!driver) notFound();

  const franchises = await listFranchises({});
  const linkedFranchises = franchises.filter(
    (f: { driverId?: { _id: string } | null }) => f.driverId?._id === id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{driver.fullName}</h1>
        <p className="text-sm text-muted-foreground">
          License {driver.driversLicenseNumber} · Expires{" "}
          {format(new Date(driver.licenseExpiry), "MMM d, yyyy")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Driver details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{driver.address}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contact number</p>
            <p className="font-medium">{driver.contactNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Operator</p>
            <p className="font-medium">
              {driver.operatorId ? (
                <Link href={`/operators/${driver.operatorId._id}`} className="hover:underline">
                  {driver.operatorId.fullName}
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
              description="No franchises have been issued for this driver yet."
            />
          ) : (
            <ul className="divide-y divide-border">
              {linkedFranchises.map(
                (f: { _id: string; franchiseNumber: string; status: FranchiseStatus }) => (
                  <li key={f._id} className="flex items-center justify-between py-2 text-sm">
                    <Link href={`/franchises/${f._id}`} className="font-medium hover:underline">
                      {f.franchiseNumber}
                    </Link>
                    <StatusBadge status={f.status} />
                  </li>
                )
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
