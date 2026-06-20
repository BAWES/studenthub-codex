import { z } from "zod";

// ---------------------------------------------------------------------------
// Candidate — aggregate output validation schemas
// ---------------------------------------------------------------------------
// Re-exports Zod schemas from candidate submodule schemas (defined in
// src/app/candidate/*/schemas.ts) providing a single module-level entrypoint.
// ---------------------------------------------------------------------------

// -- Certificates ---
export {
  certificateItemSchema as candidateCertificateItemSchema,
  listCertificatesResultSchema as candidateListCertificatesResultSchema,
  certificateActionResultSchema as candidateCertificateActionResultSchema,
  deleteCertificateResultSchema as candidateDeleteCertificateResultSchema,
  certificateDetailOutputSchema as candidateCertificateDetailOutputSchema,
} from "@/app/candidate/certificates/schemas";

export type {
  CertificateItem,
  ListCertificatesResult,
  CertificateActionResult,
  DeleteCertificateResult,
} from "@/app/candidate/certificates/schemas";

// -- Certifications ---
export {
  certificationItemOutputSchema as candidateCertificationItemOutputSchema,
  certificationListOutputSchema as candidateCertificationListOutputSchema,
  certificationActionResultOutputSchema as candidateCertificationActionResultOutputSchema,
} from "@/app/candidate/certifications/schemas";

export type {
  CertificationItem,
  CertificationActionResult,
} from "@/app/candidate/certifications/schemas";

// -- Chat ---
export {
  conversationItemOutputSchema as candidateConversationItemSchema,
  conversationMessageItemOutputSchema as candidateConversationMessageItemSchema,
  listConversationsResultOutputSchema as candidateListConversationsResultSchema,
  getConversationMessagesResultOutputSchema as candidateGetConversationMessagesResultSchema,
} from "@/app/candidate/chat/schemas";

export type {
  ConversationItem,
  ConversationMessageItem,
  ListConversationsResult,
  GetConversationMessagesResult,
} from "@/app/candidate/chat/schemas";

// -- Documents ---
export {
  documentItemOutputSchema as candidateDocumentItemOutputSchema,
  listDocumentsOutputSchema as candidateListDocumentsOutputSchema,
  getDocumentOutputSchema as candidateGetDocumentOutputSchema,
  uploadDocumentOutputSchema as candidateUploadDocumentOutputSchema,
  deleteDocumentOutputSchema as candidateDeleteDocumentOutputSchema,
} from "@/app/candidate/documents/schemas";

// -- Edit / Profile ---
export {
  profileEditDataOutputSchema as candidateProfileEditDataSchema,
  profileActionResultOutputSchema as candidateProfileActionResultSchema,
  optionsItemOutputSchema as candidateOptionsItemSchema,
  profileEditDataNullableOutputSchema as candidateProfileEditDataNullableSchema,
} from "@/app/candidate/edit/schemas";

export type {
  CandidateProfileEditData,
  ProfileActionResult,
  UpdatePersonalInfoInput,
  UpdateProfileFieldsInput,
} from "@/app/candidate/edit/schemas";

// -- Experience ---
export {
  experienceItemOutputSchema as candidateExperienceItemSchema,
  experienceActionResultOutputSchema as candidateExperienceActionResultSchema,
} from "@/app/candidate/experience/schemas";

export type {
  ExperienceItem,
  ExperienceActionResult,
} from "@/app/candidate/experience/schemas";

// -- Jobs / Applications ---
export {
  candidateJobRowSchema as candidateCandidateJobRowSchema,
  candidateJobDetailSchema as candidateCandidateJobDetailSchema,
  applicationRowSchema as candidateApplicationRowSchema,
  listCandidateJobsResultSchema as candidateListCandidateJobsResultSchema,
  getCandidateJobResultSchema as candidateGetCandidateJobResultSchema,
  applyToJobResultSchema as candidateApplyToJobResultSchema,
  listMyApplicationsResultSchema as candidateListMyApplicationsResultSchema,
} from "@/app/candidate/jobs/schemas";

export type {
  CandidateJobRow,
  CandidateJobDetail,
  ApplicationRow,
  ListCandidateJobsInput,
  GetCandidateJobInput,
  ApplyToJobInput,
  ListMyApplicationsInput,
} from "@/app/candidate/jobs/schemas";

// -- Notifications ---
export {
  notificationRowSchema as candidateNotificationRowSchema,
  notificationDetailSchema as candidateNotificationDetailSchema,
  actionResponseSchema as candidateNotificationActionResponseSchema,
} from "@/app/candidate/notifications/schemas";

// -- Schedule ---
export {
  scheduleItemOutputSchema as candidateScheduleItemSchema,
  scheduleStatusResultOutputSchema as candidateScheduleStatusResultSchema,
  scheduleDetailOutputSchema as candidateScheduleDetailSchema,
} from "@/app/candidate/schedule/schemas";

export type {
  ScheduleItem,
  ScheduleStatusResult,
  ScheduleDetail,
} from "@/app/candidate/schedule/schemas";

// -- Payments ---
export {
  paymentRowOutputSchema as candidatePaymentRowSchema,
  listPaymentsResultOutputSchema as candidateListPaymentsResultSchema,
  paymentDetailTransferOutputSchema as candidatePaymentDetailTransferSchema,
  paymentDetailOutputSchema as candidatePaymentDetailSchema,
  getPaymentDetailResultOutputSchema as candidateGetPaymentDetailResultSchema,
  paymentMethodOutputSchema as candidatePaymentMethodSchema,
  createPaymentResultOutputSchema as candidateCreatePaymentResultSchema,
} from "@/app/candidate/payments/schemas";

export type {
  PaymentRow,
  ListPaymentsResult,
  PaymentDetailTransfer,
  PaymentDetail,
  GetPaymentDetailResult,
  CreatePaymentInput,
} from "@/app/candidate/payments/schemas";

// -- Languages ---
export {
  languageItemOutputSchema as candidateLanguageItemSchema,
  languageActionResultOutputSchema as candidateLanguageActionResultSchema,
} from "@/app/candidate/languages/schemas";

export type { LanguageItem, LanguageActionResult } from "@/app/candidate/languages/schemas";

// -- Education (types only, no output schemas) ---
export type {
  EducationItem,
  EducationActionResult,
} from "@/app/candidate/education/schemas";

// -- Skills ---
export {
  skillItemOutputSchema as candidateSkillItemSchema,
  skillListOutputSchema as candidateSkillListSchema,
  skillActionResultOutputSchema as candidateSkillActionResultSchema,
} from "@/app/candidate/skills/schemas";

export type { SkillItem, SkillListResult } from "@/app/candidate/skills/schemas";

// -- References ---
export {
  referenceItemOutputSchema as candidateReferenceItemSchema,
  referenceListOutputSchema as candidateReferenceListSchema,
  referenceActionResultOutputSchema as candidateReferenceActionResultSchema,
} from "@/app/candidate/references/schemas";

// -- Work Logs ---
export {
  workLogItemOutputSchema as candidateWorkLogItemSchema,
  workLogDetailOutputSchema as candidateWorkLogDetailSchema,
  listWorkLogsResultOutputSchema as candidateListWorkLogsResultSchema,
  submitWorkLogResultOutputSchema as candidateSubmitWorkLogResultSchema,
  updateWorkLogStatusResultOutputSchema as candidateUpdateWorkLogStatusResultSchema,
} from "@/app/candidate/work-logs/schemas";

export type { WorkLogItem } from "@/app/candidate/work-logs/schemas";

// -- Shared / common result types used by multiple submodules --
export const candidateErrorResultSchema = z.object({
  error: z.string(),
});

export type CandidateErrorResult = z.output<typeof candidateErrorResultSchema>;

export const candidateSuccessResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export type CandidateSuccessResult = z.output<typeof candidateSuccessResultSchema>;
