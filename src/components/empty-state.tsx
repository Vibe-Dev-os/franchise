import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center animate-in">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={buttonVariants({ size: "sm", className: "mt-2" })}>
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <Button size="sm" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
