"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarBrand, SidebarNav } from "@/components/layout/sidebar";
import { ROLE_LABELS } from "@/components/layout/nav-config";
import type { UserRole } from "@/lib/models/User";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({
  name,
  role,
  title,
}: {
  name: string;
  role: UserRole;
  title?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" className="w-64 bg-sidebar py-4">
          <SidebarBrand />
          <div className="mt-4 flex flex-1 flex-col">
            <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 md:hidden">
        <ShieldCheck className="size-5 text-primary" />
        <span className="text-sm font-semibold">Midsalip LGU</span>
      </div>

      {title ? (
        <h1 className="hidden text-sm font-semibold text-foreground md:block">{title}</h1>
      ) : null}

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80">
                <Avatar>
                  <AvatarFallback>{initials(name)}</AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
                <span className="font-medium text-foreground">{name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {ROLE_LABELS[role]}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
