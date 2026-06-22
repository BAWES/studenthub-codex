// ---------------------------------------------------------------------------
// Admin University — barrel exports
// ---------------------------------------------------------------------------

export {
  listUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from "./actions";

export type {
  UniversityListItem,
  ListUniversitiesResult,
  UniversityIdResult,
} from "./schemas";

export {
  universityListItemSchema,
  listUniversitiesResultSchema,
  universityIdResultSchema,
} from "./schemas";
