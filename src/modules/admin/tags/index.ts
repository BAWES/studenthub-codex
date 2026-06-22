// ---------------------------------------------------------------------------
// Admin Tags - barrel exports
// ---------------------------------------------------------------------------

export {
  listTags,
  createTag,
  updateTag,
  deleteTag,
} from "./actions";

export type {
  ListTagsInput,
  CreateTagInput,
  UpdateTagInput,
  DeleteTagInput,
  TagItem,
  ListTagsResult,
  TagActionResponse,
} from "./schemas";

export {
  listTagsSchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  tagItemSchema,
  listTagsResultSchema,
  tagActionResponseSchema,
} from "./schemas";
