import {
  LayoutDashboard,
  Users,
  UserRound,
  Bike,
  FileBadge,
  ShieldAlert,
  ScrollText,
  BarChart3,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/lib/models/User";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "franchising_officer", "enforcement_officer"],
  },
  {
    href: "/enforcement",
    label: "Enforcement",
    icon: ShieldAlert,
    roles: ["admin", "enforcement_officer"],
  },
  {
    href: "/violations",
    label: "Violations",
    icon: ScrollText,
    roles: ["admin", "franchising_officer", "enforcement_officer"],
  },
  {
    href: "/franchises",
    label: "Franchises",
    icon: FileBadge,
    roles: ["admin", "franchising_officer", "enforcement_officer"],
  },
  {
    href: "/operators",
    label: "Operators",
    icon: Users,
    roles: ["admin", "franchising_officer"],
  },
  {
    href: "/drivers",
    label: "Drivers",
    icon: UserRound,
    roles: ["admin", "franchising_officer"],
  },
  {
    href: "/vehicles",
    label: "Vehicles",
    icon: Bike,
    roles: ["admin", "franchising_officer"],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "franchising_officer"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  franchising_officer: "Franchising Officer",
  enforcement_officer: "Enforcement Officer",
};
