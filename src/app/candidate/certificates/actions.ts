// ---------------------------------------------------------------------------
// Candidate Certificates — colocated server actions
// Delegates to module-level actions in @/modules/candidate/certificates/actions
// ---------------------------------------------------------------------------

export {
  listCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "@/modules/candidate/certificates/actions";

export type {
  CertificateItem,
  ListCertificatesResult,
  CertificateActionResult,
  DeleteCertificateResult,
} from "@/modules/candidate/certificates";
