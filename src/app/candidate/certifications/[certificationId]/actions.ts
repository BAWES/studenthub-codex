// ---------------------------------------------------------------------------
// Barrel re-export — delegates to module-level implementation
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/candidate/certifications/actions.ts (which
// has "use server"). This barrel re-exports so page consumers keep their
// current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

export {
  getCertification,
  updateCertification,
  deleteCertification,
} from "@/modules/candidate/certifications";
export type { CertificationActionResult, CertificationItem } from "@/modules/candidate/certifications";
