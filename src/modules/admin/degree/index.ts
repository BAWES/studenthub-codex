// ---------------------------------------------------------------------------
// Admin Degree - barrel exports
// ---------------------------------------------------------------------------

export {
  listDegrees,
  getDegree,
  createDegree,
  updateDegree,
  deleteDegree,
} from "./actions";

export type {
  ListDegreesInput,
  CreateDegreeInput,
  UpdateDegreeInput,
  DeleteDegreeInput,
  DegreeItem,
  ListDegreesResult,
  DegreeActionResponse,
} from "./schemas";

export {
  listDegreesSchema,
  createDegreeSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  degreeItemSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
} from "./schemas";
