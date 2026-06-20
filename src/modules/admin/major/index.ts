// ---------------------------------------------------------------------------
// Admin Major - barrel exports
// ---------------------------------------------------------------------------

export {
  listMajors,
  createMajor,
  updateMajor,
  deleteMajor,
} from "./actions";

export type {
  ListMajorsInput,
  CreateMajorInput,
  UpdateMajorInput,
  DeleteMajorInput,
  MajorItem,
  ListMajorsResult,
  MajorActionResponse,
} from "./schemas";

export {
  listMajorsSchema,
  createMajorSchema,
  updateMajorSchema,
  deleteMajorSchema,
  majorItemSchema,
  listMajorsResultSchema,
  majorActionResponseSchema,
} from "./schemas";
