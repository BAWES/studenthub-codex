// ---------------------------------------------------------------------------
// Pure helper functions for the Candidate Evaluation PDF report
// Extracted for testability — shared between route.ts and unit tests
// ---------------------------------------------------------------------------

/**
 * HTML-escape a string for safe interpolation into an HTML template.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validate a candidate evaluation UUID.
 */
export function validateUuid(uuid: unknown): { valid: boolean; error?: string } {
  if (!uuid || typeof uuid !== "string" || uuid.length === 0) {
    return { valid: false, error: "Missing evaluation UUID" };
  }
  return { valid: true };
}

/**
 * Calculate the average rating from an array of answer ratings.
 * Null ratings are treated as zero.
 */
export function calculateAverageRating(
  answers: Array<{ rating: number | null }>,
): string {
  if (answers.length === 0) return "\u2014";
  const sum = answers.reduce((s, a) => s + (a.rating ?? 0), 0);
  return (sum / answers.length).toFixed(1);
}

/**
 * Render a numeric rating (1-5) as star characters.
 * Clamps to 1-5 range; null returns an em-dash.
 */
export function renderStars(rating: number | null): string {
  if (rating == null) return "\u2014";
  return "\u2605".repeat(Math.min(Math.max(rating, 1), 5));
}
