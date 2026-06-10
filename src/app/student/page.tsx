import { getStudentProfile } from "./actions";

/**
 * Student Public Profile — page orchestration
 * Fetches and renders a student's public-facing profile.
 */
interface Props {
  params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: Props) {
  const { studentId } = await params;
  const profile = await getStudentProfile({ studentId });

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile Header */}
        <section className="flex items-start gap-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
            {profile.name.charAt(0) || "?"}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{profile.name || "Student Profile"}</h1>
            {profile.headline && <p className="text-lg text-muted-foreground">{profile.headline}</p>}
            {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {skill.name}
                </span>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No skills listed yet.</p>
            )}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Experience</h2>
          {profile.experience.length > 0 ? (
            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  {exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No experience listed yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
