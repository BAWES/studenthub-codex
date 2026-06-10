// Re-export company workspace data functions for the company portal.
// Functions remain in workspace/data.ts — this barrel provides the target path
// for consumers to migrate their imports incrementally.
export {
  getCompanyWorkspace,
  getCompanyAccountRows,
  getCompanyAccountDetail,
  getCompanyRequestRows,
} from "../workspace/data";
