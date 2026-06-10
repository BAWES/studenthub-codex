// Re-export company workspace data functions for the company portal.
// Functions now live in workspace/data/company.ts — this barrel provides
// a clean import path for consumers.
export {
  getCompanyDetail,
  getCompanyWorkspace,
  getCompanyAccountRows,
  getCompanyAccountDetail,
  getCompanyRequestRows,
  getCompanyRequestDetail,
} from "@/modules/workspace/data/company";
