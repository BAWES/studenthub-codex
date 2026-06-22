// ---------------------------------------------------------------------------
// Admin Reports - barrel exports
// ---------------------------------------------------------------------------

export {
  listReports,
  generateReport,
} from "./actions";

export type {
  ReportTypeItem,
  RecruiterStaffReport,
  GetRecruiterReportResult,
  ListReportsResult,
  SingleReportResult,
  GenerateReportResult,
} from "./schemas";

export {
  listReportsSchema,
  getReportSchema,
  generateReportSchema,
  reportTypeItemSchema,
  listReportsResultSchema,
  recruiterStaffReportSchema,
  getRecruiterReportResultSchema,
  singleReportSchema,
  generateReportResultSchema,
} from "./schemas";
