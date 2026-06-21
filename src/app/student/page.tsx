import { getStudentProfile } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CORAL = "#eb6651";

function AvatarCircle({ name }: { name?: string | null }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex size-24 items-center justify-center rounded-full bg-[#fef1ef] text-[#eb6651] text-3xl font-bold shrink-0">
      {initial}
    </div>
  );
}

function PeriodLabel({ startYear, endYear }: { startYear?: number | null; endYear?: number | null }) {
  if (!startYear && !endYear) return null;
  if (startYear && endYear) return <>{startYear} — {endYear}</>;
  if (startYear) return <>{startYear} (start)</>;
  return <>{endYear} (end)</>;
}

/**
 * Student Public Profile — Zendesk Coral + Slack design
 * Card-based layout with coral accent accents throughout.
 */
interface Props {
  params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: Props) {
  const { studentId } = await params;

  // If no studentId provided, show the empty state instead of crashing
  if (!studentId) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground mt-2">No candidate ID provided.</p>
        </div>
      </div>
    );
  }

  const profile = await getStudentProfile({ studentId: Number(studentId) });

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-lg text-center">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#fef1ef] text-[#eb6651] text-2xl">
                !
              </div>
              <CardTitle>Profile Not Found</CardTitle>
              <p className="text-sm text-muted-foreground">
                No candidate found with the given ID.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Card>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <AvatarCircle name={profile.name} />
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.name || "Student Profile"}
                </h1>
                {profile.intro && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {profile.intro}
                  </p>
                )}
              </div>
              {profile.objective && (
                <p className="text-sm text-muted-foreground/70">
                  {profile.objective}
                </p>
              )}
              {profile.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Skills Card ────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 28px 0",
              borderLeft: `3px solid ${CORAL}`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Skills
            </h2>
          </div>
          <div style={{ padding: 20 }}>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    style={{
                      padding: "4px 14px",
                      backgroundColor: "#fef1ef",
                      border: "1px solid rgba(235, 102, 81, 0.2)",
                      borderRadius: 999,
                      color: CORAL,
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: "24px",
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/70">
                No skills listed yet.
              </p>
            )}
          </div>
        </div>

        {/* ── Experience Card ─────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 28px 0",
              borderLeft: `3px solid ${CORAL}`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Experience
            </h2>
          </div>
          <div className="space-y-1" style={{ padding: 20 }}>
            {profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-lg border border-border bg-card p-4 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground">
                      {exp.title}
                    </h3>
                    {exp.employer && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {exp.employer}
                      </p>
                    )}
                    {(exp.startYear || exp.endYear) && (
                      <p className="mt-2 text-xs text-muted-foreground/70">
                        <PeriodLabel startYear={exp.startYear} endYear={exp.endYear} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/70">
                No experience listed yet.
              </p>
            )}
          </div>
        </div>

        {/* ── Contact Info Card ───────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "24px 28px 0",
              borderLeft: `3px solid ${CORAL}`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              Contact Info
            </h2>
          </div>
          <div className="space-y-3" style={{ padding: "16px 28px 24px" }}>
            {profile.email && (
              <div className="flex items-center gap-3">
                <span
                  style={{
                    color: CORAL,
                    fontSize: 14,
                    fontWeight: 600,
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  Email
                </span>
                <span style={{ color: "var(--ink)", fontSize: 14 }}>
                  {profile.email}
                </span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-3">
                <span
                  style={{
                    color: CORAL,
                    fontSize: 14,
                    fontWeight: 600,
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  Phone
                </span>
                <span style={{ color: "var(--ink)", fontSize: 14 }}>
                  {profile.phone}
                </span>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-3">
                <span
                  style={{
                    color: CORAL,
                    fontSize: 14,
                    fontWeight: 600,
                    width: 60,
                    flexShrink: 0,
                  }}
                >
                  Address
                </span>
                <span style={{ color: "var(--ink)", fontSize: 14 }}>
                  {profile.address}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
