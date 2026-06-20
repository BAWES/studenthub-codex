export default function LoadingPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100svh",
      padding: "2rem",
      backgroundColor: "var(--paper, #f5f7fa)",
    }}>
      {/* ── Brand header ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "48px",
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: "#1f73b7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: "-0.03em",
        }}>
          SH
        </div>
        <span style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--ink, #182230)",
        }}>
          StudentHub
        </span>
      </div>

      {/* ── Skeleton card ────────────────────────────────────────────── */}
      <div style={{
        width: "100%",
        maxWidth: 560,
        borderRadius: 16,
        backgroundColor: "var(--surface, #ffffff)",
        border: "1px solid var(--line, #d6dce7)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {/* Card header skeleton */}
        <div style={{
          padding: "28px 32px 12px",
          display: "grid",
          gap: 8,
        }}>
          <SkeletonBar width="120px" height={14} />
          <SkeletonBar width="200px" height={24} />
        </div>

        {/* Card body skeleton rows */}
        <div style={{
          padding: "12px 32px 32px",
          display: "grid",
          gap: 16,
        }}>
          <SkeletonBar width="100%" height={48} rounded={10} />
          <SkeletonBar width="100%" height={48} rounded={10} />
          <SkeletonBar width="65%" height={48} rounded={10} />
        </div>
      </div>

      {/* ── Loading text ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 24,
      }}>
        <div className="shLoadingDot" />
        <span style={{
          fontSize: 14,
          color: "var(--muted, #667085)",
          fontWeight: 500,
        }}>
          Loading your workspace...
        </span>
      </div>

      {/* ── Inline shimmer keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes shShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes shPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .shLoadingSkeleton {
          background: linear-gradient(
            90deg,
            var(--line, #e8e6e3) 25%,
            var(--sh-coral-light, #fef1ef) 50%,
            var(--line, #e8e6e3) 75%
          );
          background-size: 200% 100%;
          animation: shShimmer 1.5s ease-in-out infinite;
        }
        .shLoadingDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--sh-coral, #eb6651);
          animation: shPulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function SkeletonBar({
  width,
  height,
  rounded = 8,
}: {
  width: string;
  height: number;
  rounded?: number;
}) {
  return (
    <div
      className="shLoadingSkeleton"
      style={{
        width,
        height,
        borderRadius: rounded,
      }}
    />
  );
}
