// ---------------------------------------------------------------------------
// Admin Designations - barrel exports
// ---------------------------------------------------------------------------

export {
  listDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "./actions";

export type {
  DesignationRow,
  ListDesignationsResult,
  ActionResponse,
  ListDesignationsInput,
  CreateDesignationInput,
  UpdateDesignationInput,
} from "./schemas";

export {
  designationRowSchema,
  listDesignationsResultSchema,
  actionResponseSchema,
  listDesignationsSchema,
  createDesignationSchema,
  updateDesignationSchema,
} from "./schemas";
