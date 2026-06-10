// ---------------------------------------------------------------------------
// MatchScoreBadge — color-coded match percentage indicator
// ---------------------------------------------------------------------------
// Shows a numeric score with a visual bar and color that reflects quality:
//   90–100  → green (excellent)
//   70–89   → teal  (strong)
//   50–69   → amber (moderate)
//    0–49   → red   (weak)
//   null    → gray  (not scored)
// ---------------------------------------------------------------------------

type Props = {
  score: number | null;
  /** Optional label prefix (default "Match") */
  label?: string;
  /** Show detail bar below the score (default true) */
  showBar?: boolean;
};

function scoreColor(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score >= 90) return "#16a34a"; // green-600
  if (score >= 70) return "#0d9488"; // teal-600
  if (score >= 50) return "#d97706"; // amber-600
  return "#dc2626"; // red-600
}

function scoreBgColor(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score >= 90) return "#dcfce7"; // green-50
  if (score >= 70) return "#ccfbf1"; // teal-50
  if (score >= 50) return "#fef3c7"; // amber-50
  return "#fee2e2"; // red-50
}

function scoreLabel(score: number | null): string {
  if (score === null) return "Not scored";
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Strong match";
  if (score >= 50) return "Moderate";
  return "Weak";
}

export default function MatchScoreBadge({
  score,
  label = "Match",
  showBar = true,
}: Props) {
  const color = scoreColor(score);
  const bg = scoreBgColor(score);
  const text = scoreLabel(score);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: score !== null ? "2px 10px 2px 8px" : "2px 10px",
        borderRadius: "9999px",
        backgroundColor: bg,
        border: `1px solid ${color}20`,
        fontSize: "0.8125rem",
        fontWeight: 600,
      }}
      title={`${label}: ${score ?? "N/A"} — ${text}`}
      data-testid="match-score-badge"
    >
      {/* Score number */}
      <span style={{ color, minWidth: "28px", textAlign: "right" }}>
        {score !== null ? `${score}%` : "—"}
      </span>

      {/* Short label */}
      {showBar && score !== null && (
        <svg width="40" height="6" viewBox="0 0 40 6" aria-hidden="true">
          <rect x="0" y="0" width="40" height="6" rx="3" fill="#e5e7eb" />
          <rect
            x="0"
            y="0"
            width={Math.min(Math.max((score / 100) * 40, 2), 40)}
            height="6"
            rx="3"
            fill={color}
          />
        </svg>
      )}

      {/* Status label — only shown for non-null */}
      {score !== null && (
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>
          {text}
        </span>
      )}
    </div>
  );
}
