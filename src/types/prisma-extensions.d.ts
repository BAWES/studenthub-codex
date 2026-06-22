// ─── Prisma Model Extensions ───────────────────────────────────
// These models exist in the database but are not in the generated
// Prisma schema. This augmentation adds them to the PrismaClient type.

import type { PrismaClient } from "@prisma/client";

declare module "@prisma/client" {
  interface PrismaClient {
    job_listing: any;
    job_listing_application: any;
    candidate_reference: any;
    candidate_certification: any;
    employee: any;
    department: any;
    designation: any;
    holiday: any;
    passwordResetToken: any;
    attendance: any;
  }
}
