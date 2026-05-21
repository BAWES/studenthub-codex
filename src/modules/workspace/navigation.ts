import type { Route } from "next";
import type { Role } from "@/modules/auth/types";

export type NavItem = {
  label: string;
  href: Route;
};

export function navForRole(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      { label: "App", href: "/app" },
      { label: "Overview", href: "/admin" },
      { label: "Candidates", href: "/admin/candidates" },
      { label: "Companies", href: "/admin/companies" },
      { label: "Requests", href: "/admin/requests" },
      { label: "Transfers", href: "/admin/transfers" }
    ];
  }

  if (role === "staff") {
    return [
      { label: "App", href: "/app" },
      { label: "Overview", href: "/staff" },
      { label: "My Requests", href: "/staff/requests" },
      { label: "Candidates", href: "/staff/candidates" }
    ];
  }

  if (role === "candidate") {
    return [
      { label: "App", href: "/app" },
      { label: "Overview", href: "/candidate" },
      { label: "Invitations", href: "/candidate/invitations" },
      { label: "Work Logs", href: "/candidate/work-logs" },
      { label: "Payments", href: "/candidate/payments" }
    ];
  }

  if (role === "company") {
    return [
      { label: "App", href: "/app" },
      { label: "Overview", href: "/company" },
      { label: "Requests", href: "/company/requests" },
      { label: "Companies", href: "/company/companies" },
      { label: "Contacts", href: "/company/contacts" as Route },
      { label: "Stores", href: "/company/stores" as Route }
    ];
  }

  return [
    { label: "App", href: "/app" },
    { label: "Overview", href: "/inspector" },
    { label: "ID Requests", href: "/inspector/id-requests" }
  ];
}
