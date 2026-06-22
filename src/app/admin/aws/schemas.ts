// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All Zod schemas and types live in src/modules/admin/aws/schemas.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export * from "@/modules/admin/aws/schemas";
