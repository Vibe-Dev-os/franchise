import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT } from "@/lib/franchise-status";
import type { FranchiseStatus } from "@/lib/models/Franchise";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: FranchiseStatus; className?: string }) {
  const config = STATUS_BADGE_VARIANT[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
