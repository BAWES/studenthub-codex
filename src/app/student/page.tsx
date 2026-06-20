import { getStudentProfile } from "./actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ studentId: string }>;
}

function AvatarCircle({ name }: { name?: string | null }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex size-24 items-center justify-center rounded-full text-3xl font-bold shrink-0"
      style={{ backgroundColor: "#fef1ef", color: "#eb6651" }}
    >
      {initial}
    </div>
  );
}

function PeriodLabel({ startYear, endYear }: { startYear?: number | null; endYear?: number | null }) {
  if (!startYear && !endYear) return null;
  if (startYear && endYear) return <>{startYear} &mdash; {endYear}</>;
  if (startYear) return <>From {startYear}</>;
  return <>Until {endYear}</>;
}

export default async function StudentProfilePage({ params }: Props) {
  const { studentId } = await params;
  const studentIdNum = Number(studentId);
  if (Number.isNaN(studentIdNum) || studentIdNum <= 0) {
    notFound();
  }
  const profile = await getStudentProfile({ studentId: studentIdNum });

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="mx-auto max-w-lg text-center">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <div className="flex size-16 items-center justify-center rounded-full text-2xl"
                style={{ backgroundColor: "#fef1ef", color: "#eb6651" }}
              >
                !
              </div>
              <CardTitle>Profile Not Found</CardTitle>
              <p className="text-sm" style={{ color: "#6e6b66" }}>
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
                <h1 className="text-2xl font-bold" style={{ color: "#1d1c1a" }}>
                  {profile.name || "Student Profile"}
                </h1>
                {profile.intro && (
                  <p className="mt-1 text-lg" style={{ color: "#6e6b66" }}>
                    {profile.intro}
                  </p>
                )}
              </div>
              {profile.objective && (
                <p className="text-sm" style={{ color: "#a09d98" }}>
                  {profile.objective}
                </p>
              )}
              {profile.email && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "#6e6b66" }}>
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile.email}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#a09d98" }}>
                No skills listed yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-lg border p-4 transition-colors"
                    style={{ borderColor: "#e8e6e3", backgroundColor: "#ffffff" }}
                  >
                    <h3 className="font-semibold" style={{ color: "#1d1c1a" }}>
                      {exp.title}
                    </h3>
                    {exp.employer && (
                      <p className="mt-0.5 text-sm" style={{ color: "#6e6b66" }}>
                        {exp.employer}
                      </p>
                    )}
                    {(exp.startYear || exp.endYear) && (
                      <p className="mt-2 text-xs" style={{ color: "#a09d98" }}>
                        <PeriodLabel startYear={exp.startYear} endYear={exp.endYear} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#a09d98" }}>
                No experience listed yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
