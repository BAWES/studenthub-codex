// ---------------------------------------------------------------------------
// Tags — barrel exports
// ---------------------------------------------------------------------------

export {
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
} from "./actions";

export type {
  TagItem,
  ListTagsResult
} from "./schemas";

export {
  tagItemSchema,
  listTagsResultSchema
} from "./schemas";
