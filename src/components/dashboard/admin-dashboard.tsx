"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import {
  FileBadge,
  BadgeCheck,
  Clock,
  OctagonAlert,
  ShieldAlert,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type DashboardData = {
  kpis: {
    totalFranchises: number;
    active: number;
    expiringSoon: number;
    expired: number;
    unregisteredViolationsThisMonth: number;
  };
  statusDistribution: { name: string; value: number; key: string }[];
  violationsOverTime: { month: string; violations: number }[];
  expiringSoonList: Record<string, unknown>[];
  recentViolations: Record<string, unknown>[];
};

const STATUS_COLORS: Record<string, string> = {
  active: "var(--color-status-active)",
  expiring_soon: "var(--color-status-expiring)",
  expired: "var(--color-status-expired)",
};

const barConfig: ChartConfig = {
  violations: { label: "Violations", color: "var(--chart-2)" },
};

export function AdminDashboard({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Franchises" value={data.kpis.totalFranchises} icon={FileBadge} />
        <KpiCard label="Active" value={data.kpis.active} icon={BadgeCheck} accent="green" />
        <KpiCard
          label="Expiring in 30 Days"
          value={data.kpis.expiringSoon}
          icon={Clock}
          accent="amber"
        />
        <KpiCard label="Expired" value={data.kpis.expired} icon={OctagonAlert} accent="red" />
        <KpiCard
          label="Unregistered Violations (Month)"
          value={data.kpis.unregisteredViolationsThisMonth}
          icon={ShieldAlert}
          accent="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Franchise Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="mx-auto aspect-square max-h-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={4}
                >
                  {data.statusDistribution.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              {data.statusDistribution.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[s.key] }}
                  />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Violations Over Time (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="max-h-64 w-full">
              <BarChart data={data.violationsOverTime}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="violations" fill="var(--color-violations)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Expiring Soon</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/franchises?status=expiring_soon" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {data.expiringSoonList.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Nothing expiring soon"
                description="No franchises are expiring within the next 30 days."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franchise</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expiringSoonList.map((f) => {
                    const franchise = f as {
                      _id: string;
                      franchiseNumber: string;
                      expiryDate: string;
                      driverId?: { fullName?: string };
                    };
                    return (
                      <TableRow key={franchise._id}>
                        <TableCell className="font-medium">{franchise.franchiseNumber}</TableCell>
                        <TableCell>{franchise.driverId?.fullName ?? "—"}</TableCell>
                        <TableCell>{format(new Date(franchise.expiryDate), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/franchises/${franchise._id}`} />}
                          >
                            Renew
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Recent Violations</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/violations" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentViolations.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="No violations recorded"
                description="Violations logged by enforcement officers will appear here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Officer</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentViolations.map((v) => {
                    const violation = v as {
                      _id: string;
                      plateOrBodyNumberChecked: string;
                      violationType: string;
                      dateRecorded: string;
                      officerId?: { name?: string };
                    };
                    return (
                      <TableRow key={violation._id}>
                        <TableCell className="font-medium">
                          {violation.plateOrBodyNumberChecked}
                        </TableCell>
                        <TableCell className="capitalize">
                          {violation.violationType.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>{violation.officerId?.name ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          {format(new Date(violation.dateRecorded), "MMM d")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
