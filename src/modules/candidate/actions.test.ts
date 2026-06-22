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
  it("re-exports listCertificates as a function", () => {
    expect(typeof listCertificates).toBe("function");
  });
  it("re-exports getCertificate as a function", () => {
    expect(typeof getCertificate).toBe("function");
  });
  it("re-exports listCandidateCertifications as a function", () => {
    expect(typeof listCandidateCertifications).toBe("function");
  });
  it("re-exports getCandidateCertification as a function", () => {
    expect(typeof getCandidateCertification).toBe("function");
  });
  it("re-exports listConversations as a function", () => {
    expect(typeof listConversations).toBe("function");
  });
  it("re-exports getConversationMessages as a function", () => {
    expect(typeof getConversationMessages).toBe("function");
  });
  it("re-exports listDocuments as a function", () => {
    expect(typeof listDocuments).toBe("function");
  });
  it("re-exports getDocument as a function", () => {
    expect(typeof getDocument).toBe("function");
  });
  it("re-exports getCandidateProfileEdit as a function", () => {
    expect(typeof getCandidateProfileEdit).toBe("function");
  });
  it("re-exports listCandidateExperience as a function", () => {
    expect(typeof listCandidateExperience).toBe("function");
  });
  it("re-exports listCandidateInvitations as a function", () => {
    expect(typeof listCandidateInvitations).toBe("function");
  });
  it("re-exports listCandidateJobs as a function", () => {
    expect(typeof listCandidateJobs).toBe("function");
  });
  it("re-exports applyToJob as a function", () => {
    expect(typeof applyToJob).toBe("function");
  });
  it("re-exports getCandidateNotificationRows as a function", () => {
    expect(typeof getCandidateNotificationRows).toBe("function");
  });
  it("re-exports getCandidateProfileDetail as a function", () => {
    expect(typeof getCandidateProfileDetail).toBe("function");
  });
  it("re-exports searchCandidates as a function", () => {
    expect(typeof searchCandidates).toBe("function");
  });
  it("re-exports getCandidateDashboardStats as a function", () => {
    expect(typeof getCandidateDashboardStats).toBe("function");
  });
  it("re-exports getWorkLogDetailWithStore as a function", () => {
    expect(typeof getWorkLogDetailWithStore).toBe("function");
  });
  it("re-exports approveWorkLogAppeal as a function", () => {
    expect(typeof approveWorkLogAppeal).toBe("function");
  });
  it("re-exports rejectWorkLogAppeal as a function", () => {
    expect(typeof rejectWorkLogAppeal).toBe("function");
  });
});
