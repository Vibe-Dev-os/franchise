"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { exportReportCsv } from "@/lib/actions/reports";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { FranchiseStatus } from "@/lib/models/Franchise";

type RegistryRow = {
  _id: string;
  franchiseNumber: string;
  routeOrZone: string;
  status: FranchiseStatus;
  expiryDate: string;
  driverId?: { fullName?: string } | null;
  vehicleId?: { plateOrBodyNumber?: string } | null;
  operatorId?: { fullName?: string } | null;
};

type ComplianceRow = { zone: string; active: number; expired: number; unregisteredCaught: number };
type RevenueData = { rows: { period: string; total: number }[]; grandTotal: number };
type ViolationsData = {
  byType: { type: string; count: number }[];
  byOfficer: { officer: string; count: number }[];
  byStatus: { status: string; count: number }[];
  total: number;
};

const chartConfig: ChartConfig = {
  count: { label: "Count", color: "var(--chart-1)" },
  total: { label: "Total", color: "var(--chart-2)" },
};

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ExportButton({ type }: { type: "registry" | "compliance" | "revenue" | "violations" }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const result = await exportReportCsv(type);
    setLoading(false);
    if (result.success) {
      downloadCsv(result.data.csv, result.data.filename);
      toast.success("Report exported.");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="size-4" />
      {loading ? "Exporting..." : "Export CSV"}
    </Button>
  );
}

export function ReportsView({
  registry,
  compliance,
  revenue,
  violationsReport,
}: {
  registry: RegistryRow[];
  compliance: ComplianceRow[];
  revenue: RevenueData;
  violationsReport: ViolationsData;
}) {
  return (
    <Tabs defaultValue="registry">
      <TabsList>
        <TabsTrigger value="registry">Franchise Registry</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="violations">Violations</TabsTrigger>
      </TabsList>

      <TabsContent value="registry" className="mt-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Franchise Registry ({registry.length})</CardTitle>
            <ExportButton type="registry" />
          </CardHeader>
          <CardContent>
            {registry.length === 0 ? (
              <EmptyState icon={BarChart3} title="No franchises" description="No franchises have been issued yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franchise No.</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registry.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="font-medium">{r.franchiseNumber}</TableCell>
                      <TableCell>{r.driverId?.fullName ?? "—"}</TableCell>
                      <TableCell>{r.vehicleId?.plateOrBodyNumber ?? "—"}</TableCell>
                      <TableCell>{r.routeOrZone}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>{new Date(r.expiryDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compliance" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Compliance by Route/Zone</CardTitle>
            <ExportButton type="compliance" />
          </CardHeader>
          <CardContent>
            {compliance.length === 0 ? (
              <EmptyState icon={BarChart3} title="No data" description="No franchise or violation data yet." />
            ) : (
              <>
                <ChartContainer config={chartConfig} className="max-h-64 w-full">
                  <BarChart data={compliance}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="zone" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="active" fill="var(--color-status-active)" radius={4} />
                    <Bar dataKey="expired" fill="var(--color-status-expired)" radius={4} />
                    <Bar dataKey="unregisteredCaught" fill="var(--color-status-expiring)" radius={4} />
                  </BarChart>
                </ChartContainer>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Expired</TableHead>
                      <TableHead>Unregistered Caught</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compliance.map((c) => (
                      <TableRow key={c.zone}>
                        <TableCell className="font-medium">{c.zone}</TableCell>
                        <TableCell>{c.active}</TableCell>
                        <TableCell>{c.expired}</TableCell>
                        <TableCell>{c.unregisteredCaught}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="revenue" className="mt-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">
              Revenue by Period · Total ₱{revenue.grandTotal.toLocaleString()}
            </CardTitle>
            <ExportButton type="revenue" />
          </CardHeader>
          <CardContent>
            {revenue.rows.length === 0 ? (
              <EmptyState icon={BarChart3} title="No revenue yet" description="No paid franchise fees recorded yet." />
            ) : (
              <>
                <ChartContainer config={chartConfig} className="max-h-64 w-full">
                  <BarChart data={revenue.rows}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                  </BarChart>
                </ChartContainer>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Total collected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenue.rows.map((r) => (
                      <TableRow key={r.period}>
                        <TableCell className="font-medium">{r.period}</TableCell>
                        <TableCell>₱{r.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="violations" className="mt-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Violations Report · Total {violationsReport.total}</CardTitle>
            <ExportButton type="violations" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">By type</p>
              <Table>
                <TableBody>
                  {violationsReport.byType.map((t) => (
                    <TableRow key={t.type}>
                      <TableCell className="capitalize">{t.type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-right">{t.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">By officer</p>
              <Table>
                <TableBody>
                  {violationsReport.byOfficer.map((o) => (
                    <TableRow key={o.officer}>
                      <TableCell>{o.officer}</TableCell>
                      <TableCell className="text-right">{o.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">By status</p>
              <Table>
                <TableBody>
                  {violationsReport.byStatus.map((s) => (
                    <TableRow key={s.status}>
                      <TableCell className="capitalize">{s.status}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
