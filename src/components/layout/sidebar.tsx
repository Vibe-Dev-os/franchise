"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import type { UserRole } from "@/lib/models/User";

export function SidebarBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 ring-1 ring-sidebar-primary/30">
        <ShieldCheck className="size-5 text-sidebar-primary" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-sidebar-foreground">Midsalip LGU</span>
        <span className="text-xs text-sidebar-foreground/60">Franchise Monitoring</span>
      </span>
    </Link>
  );
}

export function SidebarNav({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/75 transition-all duration-150 ease-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-4 md:flex">
      <SidebarBrand />
      <div className="mt-6 flex flex-1 flex-col">
        <SidebarNav role={role} />
      </div>
      <div className="px-4 pt-2 text-[11px] text-sidebar-foreground/40">
        &copy; {new Date().getFullYear()} LGU Midsalip
      </div>
    </aside>
  );
}
