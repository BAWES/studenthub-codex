// ── Stage types and mapping ──────────────────────────────────────────────
// Pure utility functions — NOT server actions, safe to import anywhere.

export type PipelineStage = "pending_review" | "interviewing" | "offered" | "hired" | "rejected";

const STATUS_PENDING = 0;   // New / Pending Review
const STATUS_INTERVIEWING = 1; // Invited / Interviewing
const STATUS_OFFERED = 2;    // Offered
const STATUS_HIRED = 3;      // Hired / Placed
const STATUS_REJECTED = 4;   // Rejected / Cancelled

export function stageFromInvitationStatus(status: number): PipelineStage {
  switch (status) {
    case STATUS_PENDING: return "pending_review";
    case STATUS_INTERVIEWING: return "interviewing";
    case STATUS_OFFERED: return "offered";
    case STATUS_HIRED: return "hired";
    case STATUS_REJECTED: return "rejected";
    default: return "pending_review";
  }
}
