// ---------------------------------------------------------------------------
// Barrel re-export — re-exports types and schemas from the module
// ---------------------------------------------------------------------------
import type {
  PermissionSectionResult,
  ActionError,
} from "@/modules/admin/permission-sections/actions";

export type { PermissionSectionResult, ActionError };

export type PermissionSectionItem = PermissionSectionResult;
