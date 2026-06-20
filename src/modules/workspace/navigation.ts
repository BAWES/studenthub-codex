import type { Route } from "next";
import type { Role } from "@/modules/auth/types";
import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid, User, Mail, ClipboardList, CreditCard,
  Building2, Phone, Store, FileCheck, Search, Users,
  ArrowRightLeft, Calendar, Monitor, Clock, Briefcase, Webhook,
  FileText
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
      { label: "Companies", href: "/admin/companies", icon: Building2 },
      { label: "Requests", href: "/admin/requests", icon: FileCheck },
      { label: "Transfers", href: "/admin/transfers", icon: ArrowRightLeft },
      { label: "Agents", href: "/admin/agents", icon: Monitor },
      { label: "Employees", href: "/admin/employees", icon: Users },
      { label: "Attendance", href: "/admin/attendance", icon: Clock },
      { label: "Designations", href: "/admin/designations", icon: Briefcase },
      { label: "Candidate Requests", href: "/admin/candidate-account-requests", icon: User },
      { label: "Company Requests", href: "/admin/company-requests", icon: Building2 },
      { label: "User Requests", href: "/admin/user-requests", icon: Mail },
      { label: "Webhooks", href: "/admin/webhooks", icon: Webhook },
      { label: "Documents", href: "/admin/documents", icon: FileText },
      { label: "Stories", href: "/admin/story", icon: ClipboardList },
    ];
  }
  if (role === "staff") {
    return [
      SHARED_APP,
      { label: "Overview", href: "/staff", icon: User },
      { label: "My Requests", href: "/staff/requests", icon: FileCheck },
      { label: "Candidates", href: "/staff/candidates", icon: Users },
      { label: "Interviews", href: "/staff/interviews" as Route, icon: Calendar },
      { label: "Contracts", href: "/staff/contracts" as Route, icon: FileCheck },
      { label: "Leaves", href: "/staff/leaves" as Route, icon: Calendar },
    ];
  }
  if (role === "candidate") {
    return [
      SHARED_APP,
      { label: "Overview", href: "/candidate", icon: User },
      { label: "Jobs", href: "/candidate/jobs", icon: ClipboardList },
      { label: "My Applications", href: "/candidate/applications", icon: FileCheck },
      { label: "Invitations", href: "/candidate/invitations", icon: Mail },
      { label: "Work Logs", href: "/candidate/work-logs", icon: ClipboardList },
      { label: "Chat", href: "/candidate/chat", icon: Mail },
      { label: "Payments", href: "/candidate/payments", icon: CreditCard }
    ];
  }
  if (role === "company") {
    return [
      SHARED_APP,
      { label: "Overview", href: "/company", icon: User },
      { label: "Job Postings", href: "/employer/jobs", icon: ClipboardList },
      { label: "Requests", href: "/company/requests", icon: FileCheck },
      { label: "Search", href: "/company/search" as Route, icon: Search },
      { label: "Companies", href: "/company/companies", icon: Building2 },
      { label: "Contacts", href: "/company/contacts" as Route, icon: Phone },
      { label: "Stores", href: "/company/stores" as Route, icon: Store },
      { label: "Settings", href: "/company/company-settings" as Route, icon: User }
    ];
  }
  return [
    SHARED_APP,
    { label: "Overview", href: "/inspector", icon: User },
    { label: "ID Requests", href: "/inspector/id-requests", icon: Search }
  ];
}
