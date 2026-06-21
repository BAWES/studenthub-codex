// ---------------------------------------------------------------------------
// Admin Permissions - barrel exports
// ---------------------------------------------------------------------------

export {
  listPermissionSections,
  createPermissionSection,
  updatePermissionSection,
} from "./actions";

export type {
  ListPermissionSectionsOutput,
  CreatePermissionSectionOutput,
  UpdatePermissionSectionOutput,
  CreatePermissionSectionInput,
  UpdatePermissionSectionInput,
  PermissionSectionDetail,
} from "./schemas";

export {
  listPermissionSectionsSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsOutputSchema,
  createPermissionSectionOutputSchema,
  updatePermissionSectionOutputSchema,
} from "./schemas";
