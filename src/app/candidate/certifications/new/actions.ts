// ---------------------------------------------------------------------------
// Barrel re-export — route-level server action (actual impl lives in the
// candidate certifications module)
// ---------------------------------------------------------------------------

export { createCertification } from "@/modules/candidate/certifications/actions";

export type { CertificationActionResult } from "@/modules/candidate/certifications";
