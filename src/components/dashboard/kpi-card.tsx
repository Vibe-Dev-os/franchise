import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "default" | "amber" | "red" | "green";
}) {
  const accentClass =
    accent === "amber"
      ? "bg-status-expiring/15 text-status-expiring"
      : accent === "red"
        ? "bg-status-expired/15 text-status-expired"
        : accent === "green"
          ? "bg-status-active/15 text-status-active"
          : "bg-primary/10 text-primary";

  return (
    <Card className="rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", accentClass)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
