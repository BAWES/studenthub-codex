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

// -- Interview ---
export {
  interviewItemSchema as candidateInterviewItemSchema,
  listInterviewsResultSchema as candidateListInterviewsResultSchema,
  interviewActionResultSchema as candidateInterviewActionResultSchema,
  interviewDetailSchema as candidateInterviewDetailSchema,
} from "./interview/schemas";

export type {
  InterviewItem,
  ListInterviewsResult,
  InterviewActionResult,
  InterviewDetail,
} from "./interview/schemas";

// -- Onboarding ---
export {
  onboardingItemSchema as candidateOnboardingItemSchema,
  listOnboardingResultSchema as candidateListOnboardingResultSchema,
  onboardingActionResultSchema as candidateOnboardingActionResultSchema,
  onboardingDetailSchema as candidateOnboardingDetailSchema,
} from "./onboarding/schemas";

export type {
  OnboardingItem,
  ListOnboardingResult,
  OnboardingActionResult,
  OnboardingDetail,
} from "./onboarding/schemas";

// -- Performance ---
export {
  performanceReviewItemSchema as candidatePerformanceReviewItemSchema,
  listPerformanceReviewsResultSchema as candidateListPerformanceReviewsResultSchema,
  performanceActionResultSchema as candidatePerformanceActionResultSchema,
  performanceDetailSchema as candidatePerformanceDetailSchema,
} from "./performance/schemas";

export type {
  PerformanceReviewItem,
  ListPerformanceReviewsResult,
  PerformanceActionResult,
  PerformanceDetail,
} from "./performance/schemas";

// -- Recommendations ---
export {
  recommendationItemSchema as candidateRecommendationItemSchema,
  listRecommendationsResultSchema as candidateListRecommendationsResultSchema,
  recommendationActionResultSchema as candidateRecommendationActionResultSchema,
  recommendationDetailSchema as candidateRecommendationDetailSchema,
} from "./recommendations/schemas";

export type {
  RecommendationItem,
  ListRecommendationsResult,
  RecommendationActionResult,
  RecommendationDetail,
} from "./recommendations/schemas";

// -- Referrals ---
export {
  referralItemSchema as candidateReferralItemSchema,
  listReferralsResultSchema as candidateListReferralsResultSchema,
  referralActionResultSchema as candidateReferralActionResultSchema,
  referralDetailSchema as candidateReferralDetailSchema,
} from "./referrals/schemas";

export type {
  ReferralItem,
  ListReferralsResult,
  ReferralActionResult,
  ReferralDetail,
} from "./referrals/schemas";

// -- Support ---
export {
  supportTicketItemSchema as candidateSupportTicketItemSchema,
  listSupportTicketsResultSchema as candidateListSupportTicketsResultSchema,
  supportTicketActionResultSchema as candidateSupportTicketActionResultSchema,
  supportTicketDetailSchema as candidateSupportTicketDetailSchema,
} from "./support/schemas";

export type {
  SupportTicketItem,
  ListSupportTicketsResult,
  SupportTicketActionResult,
  SupportTicketDetail,
} from "./support/schemas";

// -- Tasks ---
export {
  taskItemSchema as candidateTaskItemSchema,
  listTasksResultSchema as candidateListTasksResultSchema,
  taskActionResultSchema as candidateTaskActionResultSchema,
  taskDetailSchema as candidateTaskDetailSchema,
} from "./tasks/schemas";

export type {
  TaskItem,
  ListTasksResult,
  TaskActionResult,
  TaskDetail,
} from "./tasks/schemas";

// -- Training ---
export {
  trainingItemSchema as candidateTrainingItemSchema,
  listTrainingResultSchema as candidateListTrainingResultSchema,
  trainingActionResultSchema as candidateTrainingActionResultSchema,
  trainingDetailSchema as candidateTrainingDetailSchema,
} from "./training/schemas";

export type {
  TrainingItem,
  ListTrainingResult,
  TrainingActionResult,
  TrainingDetail,
} from "./training/schemas";

// -- Transfers ---
export {
  transferItemSchema as candidateTransferItemSchema,
  listTransfersResultSchema as candidateListTransfersResultSchema,
  transferActionResultSchema as candidateTransferActionResultSchema,
  transferDetailSchema as candidateTransferDetailSchema,
} from "./transfers/schemas";

export type {
  TransferItem,
  ListTransfersResult,
  TransferActionResult,
  TransferDetail,
} from "./transfers/schemas";

// -- Verify ---
export {
  verificationItemSchema as candidateVerificationItemSchema,
  listVerificationsResultSchema as candidateListVerificationsResultSchema,
  verificationActionResultSchema as candidateVerificationActionResultSchema,
  verificationDetailSchema as candidateVerificationDetailSchema,
} from "./verify/schemas";

export type {
  VerificationItem,
  ListVerificationsResult,
  VerificationActionResult,
  VerificationDetail,
} from "./verify/schemas";

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
