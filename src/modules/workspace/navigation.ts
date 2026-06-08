import type { Route } from "next";
import type { Role } from "@/modules/auth/types";
import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid, User, Mail, ClipboardList, CreditCard,
  Building2, Phone, Store, FileCheck, Search, Users,
  ArrowRightLeft, Calendar
} from "lucide-react";

export type NavItem = {
  label: string;
  href: Route;
  icon: LucideIcon;
};

const SHARED_APP: NavItem = { label: "App", href: "/app", icon: LayoutGrid };

export function navForRole(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      SHARED_APP,
      { label: "Overview", href: "/admin", icon: User },
      { label: "Candidates", href: "/admin/candidates", icon: Users },
      { label: "Companies", href: "/app/companies", icon: Building2 },
      { label: "Requests", href: "/app/requests", icon: FileCheck },
      { label: "Transfers", href: "/admin/transfers", icon: ArrowRightLeft }
    ];
  }
  if (role === "staff") {
    return [
      SHARED_APP,
      { label: "Overview", href: "/staff", icon: User },
      { label: "My Requests", href: "/app/requests", icon: FileCheck },
      { label: "Candidates", href: "/app/companies", icon: Users },
      { label: "Interviews", href: "/staff/interviews" as Route, icon: Calendar }
    ];
  }
  if (role === "candidate") {
    return [
      SHARED_APP,
      { label: "Profile", href: "/app/profile", icon: User },
      { label: "Invitations", href: "/app/profile/invitations", icon: Mail },
      { label: "Work Logs", href: "/app/profile/work-logs", icon: ClipboardList },
      { label: "Payments", href: "/app/profile/payments", icon: CreditCard }
    ];
  }
  if (role === "company") {
    return [
      SHARED_APP,
      { label: "Overview", href: "/company", icon: User },
      { label: "Requests", href: "/app/requests", icon: FileCheck },
      { label: "Companies", href: "/app/companies", icon: Building2 },
      { label: "Contacts", href: "/company/contacts" as Route, icon: Phone },
      { label: "Stores", href: "/company/stores" as Route, icon: Store }
    ];
  }
  return [
    SHARED_APP,
    { label: "Overview", href: "/inspector", icon: User },
    { label: "ID Requests", href: "/inspector/id-requests", icon: Search }
  ];
}
