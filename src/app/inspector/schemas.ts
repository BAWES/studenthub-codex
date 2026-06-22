// ---------------------------------------------------------------------------
// Inspector Workspace — Schemas (page-level re-exports)
// ---------------------------------------------------------------------------
// All schema definitions live in src/modules/inspector/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export {
  getInspectorWorkspaceSchema,
  inspectorMetricSchema,
  inspectorRequestRowSchema,
  inspectorObjectOutputSchema,
  inspectorWorkspaceOutputSchema,
  type InspectWorkspaceResult,
} from "@/modules/inspector/schemas";
