// ---------------------------------------------------------------------------
// Inspector Workspace — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/inspector/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export { getInspectorWorkspace } from "@/modules/inspector/actions";
