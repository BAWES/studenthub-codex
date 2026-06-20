// ---------------------------------------------------------------------------
// Employer Dashboard — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/dashboard/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getEmployerDashboardData } from "@/modules/employer/dashboard/actions";
