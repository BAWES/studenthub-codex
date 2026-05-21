import type { Role } from "./types";

export const portalContent: Record<Role, { label: string; audience: string; promise: string; href: string }> = {
  candidate: {
    label: "Students & candidates",
    audience: "Build profile, find jobs, track hours, see pay",
    promise: "A mobile-first work app for profile readiness, invitations, shifts, documents, and payment visibility.",
    href: "/login"
  },
  staff: {
    label: "Staff operations",
    audience: "Match people, send CVs, manage work",
    promise: "A focused operating desk for requests, candidate search, shortlists, CV/PDF exports, time, pay, and ID workflows.",
    href: "/login"
  },
  company: {
    label: "Companies",
    audience: "Request workers, review candidates, receive invoices",
    promise: "A clean employer workspace for hiring demand, candidate review, stores, approvals, and invoice history.",
    href: "/login"
  },
  admin: {
    label: "Admin",
    audience: "Run approvals, finance, payroll, migration",
    promise: "The command layer for system-wide operations, compliance, transfers, invoicing, and production-data validation.",
    href: "/login"
  },
  inspector: {
    label: "Inspectors",
    audience: "Review civil ID and document queues",
    promise: "A dedicated compliance workspace for ID batches and document decisions without mixing placement work.",
    href: "/login"
  }
};
