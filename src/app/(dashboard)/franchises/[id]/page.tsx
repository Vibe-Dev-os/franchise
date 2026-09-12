import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { FileBadge, RefreshCcw } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getFranchise } from "@/lib/actions/franchises";
import { StatusBadge } from "@/components/status-badge";
import { FranchiseDetailActions } from "@/components/franchises/franchise-detail-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default async function FranchiseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const franchise = await getFranchise(id);
  if (!franchise) notFound();

  const canManage =
    session?.user.role === "admin" || session?.user.role === "franchising_officer";

  const driver = franchise.driverId as { _id: string; fullName: string } | null;
  const vehicle = franchise.vehicleId as
    | { _id: string; plateOrBodyNumber: string; vehicleType: string }
    | null;
  const operator = franchise.operatorId as { _id: string; fullName: string } | null;
  const renewalHistory = (franchise.renewalHistory as
    | {
        renewedAt: string;
        renewedBy?: { name: string } | null;
        previousExpiryDate: string;
        newExpiryDate: string;
      }[]
    | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{franchise.franchiseNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Issued {format(new Date(franchise.dateIssued as string), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={franchise.status} className="text-sm" />
          {canManage ? <FranchiseDetailActions franchise={franchise} /> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Franchise details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Driver</p>
            <p className="font-medium">
              {driver ? (
                <Link href={`/drivers/${driver._id}`} className="hover:underline">
                  {driver.fullName}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Vehicle</p>
            <p className="font-medium">
              {vehicle ? (
                <Link href={`/vehicles/${vehicle._id}`} className="hover:underline">
                  {vehicle.plateOrBodyNumber} ({vehicle.vehicleType})
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Operator</p>
            <p className="font-medium">
              {operator ? (
                <Link href={`/operators/${operator._id}`} className="hover:underline">
                  {operator.fullName}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Route / zone</p>
            <p className="font-medium">{franchise.routeOrZone as string}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expiry date</p>
            <p className="font-medium">{format(new Date(franchise.expiryDate), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fee</p>
            <p className="font-medium">
              ₱{Number(franchise.feeAmount).toLocaleString()} ·{" "}
              <span className={franchise.feePaid ? "text-status-active" : "text-status-expired"}>
                {franchise.feePaid ? "Paid" : "Unpaid"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCcw className="size-4" />
            Renewal history ({renewalHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renewalHistory.length === 0 ? (
            <EmptyState
              icon={FileBadge}
              title="No renewals yet"
              description="This franchise has not been renewed."
            />
          ) : (
            <ul className="divide-y divide-border">
              {renewalHistory.map((r, i) => (
                <li key={i} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {format(new Date(r.previousExpiryDate), "MMM d, yyyy")} →{" "}
                    {format(new Date(r.newExpiryDate), "MMM d, yyyy")}
                  </span>
                  <span className="text-muted-foreground">
                    by {r.renewedBy?.name ?? "Unknown"} on{" "}
                    {format(new Date(r.renewedAt), "MMM d, yyyy")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
