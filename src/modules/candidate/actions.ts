"use server";

// ---------------------------------------------------------------------------
// Candidate — module-level server actions barrel
// ---------------------------------------------------------------------------
// Re-exports server actions from candidate sub-modules (certificates, chat,
// documents, edit, notifications, profile, search, statistics, work-logs)
// providing a single entrypoint for import at the app route level.
// Each sub-module has its own "use server" actions with colocated Zod schemas
// and tests in src/modules/candidate/{submodule}/.
// ---------------------------------------------------------------------------

// -- Certificates --
export {
  listCertificates,
  getCertificate,
  createCertificate,
} from "./certificates/actions";

// -- Certifications --
export {
  listCandidateCertifications,
  getCandidateCertification,
  createCandidateCertification,
} from "./certifications/actions";

// -- Chat --
export {
  listConversations,
  getConversationMessages,
} from "./chat/actions";

// -- Documents --
export {
  listDocuments,
  getDocument,
  uploadDocument,
} from "./documents/actions";

// -- Edit (profile) --
export {
  getCandidateProfileEdit,
  getCountryOptions,
  getUniversityOptions,
} from "./edit/actions";

// -- Experience --
export {
  listCandidateExperience,
  getCandidateExperience,
  createCandidateExperience,
} from "./experience/actions";

// -- Invitations --
export {
  listCandidateInvitations,
  getCandidateInvitationDetail,
} from "./invitations/actions";

// -- Jobs --
export {
  listCandidateJobs,
  getCandidateJob,
  applyToJob,
} from "./jobs/actions";

// -- Notifications --
export {
  getCandidateNotificationRows,
  getCandidateNotificationDetail,
} from "./notifications/actions";

// -- Profile --
export {
  getCandidateProfileDetail,
} from "./profile/actions";

// -- Search --
export {
  searchCandidates,
} from "./search/actions";

// -- Statistics --
export {
  getCandidateDashboardStats,
} from "./statistics/actions";

// -- Work Logs --
export {
  getWorkLogDetailWithStore,
  approveWorkLogAppeal,
  rejectWorkLogAppeal,
} from "./work-logs/actions";
