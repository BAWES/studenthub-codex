// ---------------------------------------------------------------------------
// Staff — Leaves Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/staff-leaves/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  listStaffLeaves,
  getStaffLeave,
  createStaffLeave,
} from "@/modules/staff-leaves/actions";
