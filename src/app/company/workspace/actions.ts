// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic now lives in src/modules/company/workspace/ (module-level
// Prisma wrappers with no auth/validation/revalidation). The page-level
// server actions live in src/app/company/workspace/[id]/actions.ts.
// This barrel re-exports so page consumers keep their current import paths.
// ---------------------------------------------------------------------------

export { getWorkspace as getCompanyWorkspace } from "./[id]/actions";
