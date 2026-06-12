// ---------------------------------------------------------------------------
// Inspector ID Request Detail — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/inspector/id-requests/[id]/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  inspectorIdRequestActionResultSchema,
  type InspectorIdRequestActionResult,
} from "@/modules/inspector/id-requests/[id]/schemas";
