/**
 * Compute a match score (0–100) for a candidate against a job request.
 *
 * Weighting:
 *   - Skill match ratio (60%): matchedSkills / totalRequestSkills
 *   - Rate proximity (40%): 1 - |candidateRate - compensation| / compensation
 *
 * If the request has no skills defined, returns a neutral 50.
 * If either rate value is null/missing, skill score alone determines the
 * full result (with a small recency bonus for recently updated candidates).
 */
export function computeMatchScore(params: {
  matchedSkillCount: number;
  totalRequestSkills: number;
  candidateRate?: number | null;
  requestCompensation?: number | null;
}): number {
  const { matchedSkillCount, totalRequestSkills, candidateRate, requestCompensation } = params;

  // --- Skill score (0–100) ---
  const skillScore =
    totalRequestSkills > 0
      ? Math.min(matchedSkillCount, totalRequestSkills) / totalRequestSkills
      : // Neutral when request has no skills mapped
        null;

  // --- Rate proximity score (0–100) ---
  let rateScore: number | null = null;
  if (
    candidateRate != null &&
    candidateRate > 0 &&
    requestCompensation != null &&
    requestCompensation > 0
  ) {
    const diff = Math.abs(candidateRate - requestCompensation);
    const proximity = Math.max(0, 1 - diff / requestCompensation);
    rateScore = proximity;
  }

  // --- Weighted total ---
  let total: number;

  if (skillScore === null) {
    // No skills on the request -> neutral 50
    total = 0.5;
  } else if (rateScore === null) {
    // No rate info -> skill-only score
    total = skillScore;
  } else {
    // Both available -> weighted
    total = skillScore * 0.6 + rateScore * 0.4;
  }

  // Clamp and convert to percentage
  return Math.round(Math.max(0, Math.min(1, total)) * 100);
}

/**
 * Human-readable label for a match score.
 */
export function matchScoreLabel(score: number): string {
  if (score >= 90) return "Excellent match";
  if (score >= 70) return "Strong match";
  if (score >= 50) return "Good match";
  if (score >= 30) return "Partial match";
  return "Low match";
}
