export {
  createDegreeSchema,
  updateDegreeSchema,
  deleteDegreeSchema,
  degreeItemSchema,
  listDegreesResultSchema,
  degreeActionResponseSchema,
} from "./schemas";

export type {
  CreateDegreeInput,
  UpdateDegreeInput,
  DeleteDegreeInput,
  DegreeItem,
  ListDegreesResult,
  DegreeActionResponse,
} from "./schemas";

export {
  listDegrees,
  createDegree,
  updateDegree,
  deleteDegree,
} from "./actions";
export type { ListDegreesParams } from "./actions";
