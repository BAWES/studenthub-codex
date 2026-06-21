// ---------------------------------------------------------------------------
// MatchScoreBadge — color-coded match percentage indicator
// ---------------------------------------------------------------------------
// Shows a numeric score with a visual bar and color that reflects quality:
//   75+     → gold  (strong)
//   50–74   → green (moderate)
//   25–49   → blue  (low)
//    0–24   → gray  (weak)
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
  if (score >= 75) return "#eab308"; // gold-500 (yellow-500)
  if (score >= 50) return "#16a34a"; // green-600
  if (score >= 25) return "#2563eb"; // blue-600
  return "var(--muted)"; // gray — weak
}

function scoreBgColor(score: number | null): string {
  if (score === null) return "transparent";
  if (score >= 75) return "#fef9c3"; // gold-100
  if (score >= 50) return "#dcfce7"; // green-50
  if (score >= 25) return "#dbeafe"; // blue-50
  return "transparent";
}

function scoreLabel(score: number | null): string {
  if (score === null) return "Not scored";
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Low";
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
      className="inline-flex items-center gap-2 rounded-full text-[13px] font-semibold"
      style={{
        padding: score !== null ? "2px 10px 2px 8px" : "2px 10px",
        backgroundColor: bg,
        border: `1px solid ${color}20`,
      }}
      title={`${label}: ${score ?? "N/A"} — ${text}`}
      data-testid="match-score-badge"
    >
      {/* Score number */}
      <span className="min-w-[28px] text-right" style={{ color }}>
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
        <span className="text-[var(--muted)] font-normal">
          {text}
        </span>
      )}
    </div>
  );
}
