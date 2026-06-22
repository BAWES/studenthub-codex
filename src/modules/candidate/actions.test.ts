import { describe, it, expect } from "vitest";
import {
  listCertificates,
  getCertificate,
  listCandidateCertifications,
  getCandidateCertification,
  listConversations,
  getConversationMessages,
  listDocuments,
  getDocument,
  getCandidateProfileEdit,
  listCandidateExperience,
  listCandidateInvitations,
  listCandidateJobs,
  applyToJob,
  getCandidateNotificationRows,
  getCandidateProfileDetail,
  searchCandidates,
  getCandidateDashboardStats,
  getWorkLogDetailWithStore,
  approveWorkLogAppeal,
  rejectWorkLogAppeal,
} from "./actions";

describe("candidate module actions barrel", () => {
  const actionFunctions = [
    ["listCertificates", listCertificates],
    ["getCertificate", getCertificate],
    ["listCandidateCertifications", listCandidateCertifications],
    ["getCandidateCertification", getCandidateCertification],
    ["listConversations", listConversations],
    ["getConversationMessages", getConversationMessages],
    ["listDocuments", listDocuments],
    ["getDocument", getDocument],
    ["getCandidateProfileEdit", getCandidateProfileEdit],
    ["listCandidateExperience", listCandidateExperience],
    ["listCandidateInvitations", listCandidateInvitations],
    ["listCandidateJobs", listCandidateJobs],
    ["applyToJob", applyToJob],
    ["getCandidateNotificationRows", getCandidateNotificationRows],
    ["getCandidateProfileDetail", getCandidateProfileDetail],
    ["searchCandidates", searchCandidates],
    ["getCandidateDashboardStats", getCandidateDashboardStats],
    ["getWorkLogDetailWithStore", getWorkLogDetailWithStore],
    ["approveWorkLogAppeal", approveWorkLogAppeal],
    ["rejectWorkLogAppeal", rejectWorkLogAppeal],
  ];

  it.each(actionFunctions)("re-exports %s as a function", (_name, fn) => {
    expect(typeof fn).toBe("function");
  });
});
