// ---------------------------------------------------------------------------
// Degree-groups — barrel exports
// ---------------------------------------------------------------------------

export {
  listDegreeGroups,
  getDegreeGroup,
  createDegreeGroup,
  updateDegreeGroup
} from "./actions";

export type {
  DegreeGroupItem,
  ListDegreeGroupsResult,
  MutationResult,
  ListDegreeGroupsInput,
  GetDegreeGroupInput,
  CreateDegreeGroupInput,
  UpdateDegreeGroupInput
} from "./schemas";

export {
  degreeGroupItemSchema,
  listDegreeGroupsResultSchema,
  mutationResultSchema,
  listDegreeGroupsSchema,
  getDegreeGroupSchema,
  createDegreeGroupSchema,
  updateDegreeGroupSchema
} from "./schemas";
