// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/candidate/work-logs/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep
// their current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export * from "@/modules/candidate/work-logs/actions";
