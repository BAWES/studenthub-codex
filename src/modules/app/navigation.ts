// ---------------------------------------------------------------------------
// Navigation and access helpers for the hub workspace module
// ---------------------------------------------------------------------------

import type { Route } from "next";
import type { Role } from "@/modules/auth/types";
import type { HubNavigationItem } from "./types";

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

export function candidateHref(session: { role: Role; id: string }, candidateId: number) {
  if (session.role === "admin") return `/admin/candidates/${candidateId}` as Route;
  if (session.role === "staff") return `/staff/candidates/${candidateId}` as Route;
  if (session.role === "candidate" && Number(session.id) === candidateId)
    return "/candidate" as Route;
  return undefined;
}

export function candidateListHref(
  session: { role: Role },
  filter: "needs-review" | "incomplete",
) {
  if (session.role === "admin") return "/admin/candidates" as Route;
  if (session.role === "staff")
    return `/staff/candidates?filter=${filter}` as Route;
  return undefined;
}

export function companyHref(session: { role: Role }, companyId: number) {
  if (session.role === "admin")
    return `/admin/companies/${companyId}` as Route;
  if (session.role === "company")
    return `/company/companies/${companyId}` as Route;
  return undefined;
}

export function requestHref(session: { role: Role }, requestUuid: string) {
  if (session.role === "admin")
    return `/admin/requests/${requestUuid}` as Route;
  if (session.role === "staff")
    return `/staff/requests/${requestUuid}` as Route;
  if (session.role === "company")
    return `/company/requests/${requestUuid}` as Route;
  return undefined;
}

export function requestListHref(session: { role: Role }) {
  if (session.role === "admin") return "/admin/requests" as Route;
  if (session.role === "staff") return "/staff/requests" as Route;
  if (session.role === "company") return "/company/requests" as Route;
  return undefined;
}

// ---------------------------------------------------------------------------
// Workspace navigation
// ---------------------------------------------------------------------------

export function workspaceNavigation(role: Role): HubNavigationItem[] {
  const shared = [
    { label: "Command", description: "Search and triage", href: "/app" as Route },
  ];
  const items: Record<Role, HubNavigationItem[]> = {
    admin: [
      ...shared,
      {
        label: "Candidates",
        description: "Approval and profiles",
        href: "/admin/candidates" as Route,
      },
      {
        label: "Companies",
        description: "Employer accounts",
        href: "/admin/companies" as Route,
      },
      {
        label: "Requests",
        description: "Hiring pipeline",
        href: "/admin/requests" as Route,
      },
      {
        label: "Transfers",
        description: "Payroll records",
        href: "/admin/transfers" as Route,
      },
    ],
    staff: [
      ...shared,
      {
        label: "My requests",
        description: "Assigned demand",
        href: "/staff/requests" as Route,
      },
      {
        label: "My candidates",
        description: "Assigned candidate records",
        href: "/staff/candidates" as Route,
      },
    ],
    candidate: [
      ...shared,
      {
        label: "Invitations",
        description: "Job invitations",
        href: "/candidate/invitations" as Route,
      },
      {
        label: "Work logs",
        description: "Shifts and history",
        href: "/candidate/work-logs" as Route,
      },
    ],
    company: [
      ...shared,
      {
        label: "Company profile",
        description: "Linked accounts",
        href: "/company/companies" as Route,
      },
      {
        label: "Requests",
        description: "Hiring requests",
        href: "/company/requests" as Route,
      },
    ],
    inspector: [
      ...shared,
      {
        label: "ID requests",
        description: "Civil ID batches",
        href: "/inspector/id-requests" as Route,
      },
    ],
  };
  return items[role];
}

// ---------------------------------------------------------------------------
// Access summary
// ---------------------------------------------------------------------------

export function accessSummary(role: Role) {
  const summaries: Record<
    Role,
    { title: string; note: string; items: string[] }
  > = {
    admin: {
      title: "Admin access",
      note: "This account can operate across the imported system.",
      items: [
        "Candidate approvals",
        "Employer accounts",
        "Requests",
        "Payroll transfers",
      ],
    },
    staff: {
      title: "Staff access",
      note:
        "This account only shows assigned requests and candidate records connected to this staff member.",
      items: [
        "Assigned requests",
        "Assigned candidates",
        "Related notes",
        "Related work history",
      ],
    },
    candidate: {
      title: "Candidate access",
      note:
        "This account only shows the signed-in candidate profile, invitations, and work logs.",
      items: ["Own profile", "Own invitations", "Own work logs"],
    },
    company: {
      title: "Company access",
      note:
        "This account only shows companies and requests linked to this company contact.",
      items: ["Linked companies", "Company requests", "Company contacts", "Stores"],
    },
    inspector: {
      title: "Inspector access",
      note:
        "This account only shows civil ID verification queues.",
      items: ["ID request batches", "Candidate records inside ID batches"],
    },
  };
  return summaries[role];
}
