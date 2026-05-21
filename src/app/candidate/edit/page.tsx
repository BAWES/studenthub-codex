import { requireRoleCapability } from "@/modules/auth/session";
import { CandidateEditForm } from "@/modules/candidates/CandidateEditForm";
import { getCountryOptions, getUniversityOptions, getBankOptions } from "@/modules/candidates/actions";
import { getCandidateDetail } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function CandidateEditPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const [data, countries, universities, banks] = await Promise.all([
    getCandidateDetail(Number(session.id), "/candidate/invitations"),
    getCountryOptions(),
    getUniversityOptions(),
    getBankOptions(),
  ]);
  const c = data.candidate;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Edit Profile"
      title="Update your candidate profile"
      metrics={data.metrics}
    >
      <CandidateEditForm
        candidate={{
          name: c?.candidate_name ?? "",
          nameAr: c?.candidate_name_ar ?? "",
          email: c?.candidate_email ?? "",
          phone: c?.candidate_phone ?? "",
          objective: c?.candidate_objective ?? "",
          intro: c?.candidate_intro ?? "",
          civilId: c?.candidate_civil_id ?? "",
          profileUrl: c?.profile_url ?? "",
          birthDate: c?.candidate_birth_date
            ? new Date(c.candidate_birth_date).toISOString().slice(0, 10)
            : "",
          address: c?.candidate_address_line1 ?? "",
          countryId: c?.country_id ?? null,
          universityId: c?.university_id ?? null,
          bankId: c?.bank_id ?? null,
          bankAccountName: c?.bank_account_name ?? "",
          iban: c?.candidate_iban ?? "",
          personalPhoto: c?.candidate_personal_photo ?? null,
          resume: c?.candidate_resume ?? null,
          video: c?.candidate_video ?? null,
          civilPhotoFront: c?.candidate_civil_photo_front ?? null,
          civilPhotoBack: c?.candidate_civil_photo_back ?? null,
        }}
        countries={countries}
        universities={universities}
        banks={banks}
        skills={data.skills.map((s) => ({ id: Number(s.id), title: s.title }))}
        experiences={data.experiences.map((e) => ({
          id: Number(e.id),
          title: e.title,
          subtitle: e.subtitle,
        }))}
        certificates={data.certificates.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
        }))}
      />
    </WorkspaceShell>
  );
}
