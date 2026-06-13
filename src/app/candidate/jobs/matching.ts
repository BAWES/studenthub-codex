// ---------------------------------------------------------------------------
// Job Matching Algorithm — re-exports from module
// ---------------------------------------------------------------------------
// All scoring logic and Prisma queries now live in src/modules/matching/.
// Async functions (scoreJobForCandidate, scoreJobsForCandidate) live in
// src/modules/matching/actions.ts (server action).
// Sync utilities (extractSkills, JobMatchScore) live in
// src/modules/matching/utils.ts (pure functions).
// ---------------------------------------------------------------------------

import { type JobMatchScore, extractSkills } from "@/modules/matching/utils";

export type { JobMatchScore };

export { extractSkills };

export {
  scoreJobForCandidate,
  scoreJobsForCandidate,
} from "@/modules/matching/actions";
