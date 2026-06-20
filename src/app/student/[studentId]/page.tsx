import { getStudentProfile } from "../actions";
import { notFound } from "next/navigation";
import {
  HeroSection,
  SkillsSection,
  ExperienceSection,
  NotFoundState,
} from "./_components";

/**
 * Student Public Profile — redesigned with Zendesk Coral + Slack aesthetic.
 * Fetches and renders a student's public-facing profile.
 */
interface Props {
  params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: Props) {
  const { studentId } = await params;
  const studentIdNum = Number(studentId);
  if (Number.isNaN(studentIdNum) || studentIdNum <= 0) {
    notFound();
  }
  const profile = await getStudentProfile({ studentId: studentIdNum });

  if (!profile) {
    return <NotFoundState />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <HeroSection profile={profile} />
        <SkillsSection skills={profile.skills} />
        <ExperienceSection experience={profile.experience} />
      </div>
    </div>
  );
}
