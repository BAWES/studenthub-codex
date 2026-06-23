// ---------------------------------------------------------------------------
// Candidate Certifications — colocated server actions
// Delegates to module-level actions in @/modules/candidate/certifications/actions
// ---------------------------------------------------------------------------

export {
  listCandidateCertifications,
  getCandidateCertification,
  createCandidateCertification,
  updateCandidateCertification,
  deleteCandidateCertification,
} from "@/modules/candidate/certifications/actions";

export type {
  CertificationActionResult,
  CertificationItem,
} from "@/modules/candidate/certifications";
