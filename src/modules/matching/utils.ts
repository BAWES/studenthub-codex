// ---------------------------------------------------------------------------
// Job Matching Utilities — pure functions, no server-only code
// ---------------------------------------------------------------------------
// These are used by both server actions (matching/actions.ts) and
// client-side code. They MUST NOT depend on "use server" or Prisma.
// ---------------------------------------------------------------------------

export type JobMatchScore = {
  overall: number; // 0–100
  skillScore: number; // 0–100
  educationScore: number; // 0–100
  locationScore: number; // 0–100
  typeScore: number; // 0–100
};

const SKILL_DELIMITERS = /[,;•·\n\r\t]+/;
const STOP_WORDS = new Set([
  "and", "or", "the", "a", "an", "of", "in", "to", "for", "with",
  "is", "are", "be", "has", "have", "must", "should", "able",
  "experience", "skills", "knowledge", "proficiency", "required",
  "preferred", "including", "such", "like", "etc",
]);

/**
 * Extract individual skill terms from free-text requirements.
 * Splits on delimiters (commas, semicolons, bullets, newlines),
 * then removes stop words from each phrase while preserving multi-word terms.
 */
export function extractSkills(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(SKILL_DELIMITERS)
    .map((phrase) => {
      const trimmed = phrase.trim().toLowerCase();
      if (!trimmed) return "";
      // Split into words, filter stop words and short tokens
      const words = trimmed.split(/\s+/).filter((w) => {
        const clean = w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
        return clean.length >= 2 && !STOP_WORDS.has(clean);
      });
      return words.join(" ");
    })
    .filter((phrase) => phrase.length > 0);
}
