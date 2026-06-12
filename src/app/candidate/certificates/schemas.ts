import { z } from "zod";
import {
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
} from "@/modules/candidates/certificates/schemas";

// ---------------------------------------------------------------------------
// Output validation — re-exports module-level schemas for route-level
// safeParse guards in actions.ts
// ---------------------------------------------------------------------------

export {
  certificateItemSchema,
  listCertificatesResultSchema,
  certificateActionResultSchema,
  deleteCertificateResultSchema,
};

/** Nullable variant for getCertificate which returns CertificateItem | null */
export const certificateDetailOutputSchema = certificateItemSchema.nullable();
