"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { ProfileState, EducationState, LanguageState } from "@/modules/candidates/actions";
import {
  updateCandidateProfile,
  uploadDocument,
  addCandidateSkill,
  removeCandidateSkill,
  addCandidateExperience,
  removeCandidateExperience,
  addCandidateCertificate,
  removeCandidateCertificate,
  addCandidateEducation,
  removeCandidateEducation,
  addCandidateLanguage,
  removeCandidateLanguage,
} from "@/modules/candidates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

type Option = { id: number; label: string };
type UuidOption = { id: string; label: string };

type Skill = { id: number; title: string };
type Experience = { id: number; title: string; subtitle: string };
type Certificate = { id: string; title: string; subtitle: string };
type Language = { id: number; title: string; subtitle: string };
type EducationEntry = {
  id: string;
  universityId: number;
  degreeUuid: string | null;
  majorUuid: string | null;
  graduationYear: number | null;
  isCurrentlyStudying: boolean;
  universityLabel: string;
  degreeLabel?: string;
  majorLabel?: string;
};

type Props = {
  candidate: {
    name: string;
    nameAr: string;
    email: string;
    phone: string;
    objective: string;
    intro: string;
    civilId: string;
    profileUrl: string;
    birthDate: string;
    address: string;
    countryId: number | null;
    universityId: number | null;
    bankId: number | null;
    bankAccountName: string;
    iban: string;
    personalPhoto: string | null;
    resume: string | null;
    video: string | null;
    civilPhotoFront: string | null;
    civilPhotoBack: string | null;
  };
  countries: Option[];
  universities: Option[];
  banks: Option[];
  skills: Skill[];
  experiences: Experience[];
  certificates: Certificate[];
  languages: Language[];
  educationEntries: EducationEntry[];
  degrees: UuidOption[];
  majors: UuidOption[];
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      {children}
    </div>
  );
}

function InlineFields({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function ListView({ children, empty, isEmpty }: { children: React.ReactNode; empty: React.ReactNode; isEmpty: boolean }) {
  if (isEmpty) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-2">{children}</div>;
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-destructive">{errors[0]}</p> : null;
}

function DocumentUpload({ label, type, current }: { label: string; type: string; current: string | null }) {
  return (
    <fieldset className="rounded-md border bg-card p-3">
      <legend className="px-1 text-sm font-medium text-foreground">{label}</legend>
      <input type="hidden" name="type" value={type} />
      <Input type="file" name={`file_${type}`} accept={acceptFor(type)} className="h-9" />
      {current ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Current: <a href={current} target="_blank" rel="noreferrer" className="underline hover:text-primary">{current.split("/").pop()}</a>
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">No file uploaded yet.</p>
      )}
    </fieldset>
  );
}

function acceptFor(type: string): string {
  switch (type) {
    case "photo": case "civilFront": case "civilBack": return "image/*";
    case "cv": return ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "video": return "video/*";
    default: return "*/*";
  }
}

function EditableItem({ children, onRemove }: { children: React.ReactNode; onRemove: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
      <span>{children}</span>
      {onRemove}
    </div>
  );
}

function RemoveForm({ id, action, pending, hiddenFields }: { id: string; action: (formData: FormData) => void; pending: boolean; hiddenFields: Record<string, string | number> }) {
  return (
    <form id={id} action={action} className="inline">
      {Object.entries(hiddenFields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={String(v)} />
      ))}
      <Button type="submit" variant="outline" size="sm" disabled={pending} form={id}>
        {pending ? "Removing..." : "Remove"}
      </Button>
    </form>
  );
}

export function CandidateEditForm({
  candidate, countries, universities, banks,
  skills, experiences, certificates, languages,
  educationEntries, degrees, majors
}: Props) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateCandidateProfile,
    { success: false } as ProfileState,
  );

  useEffect(() => {
    if (profileState.success) {
      toast.success("Profile saved", { description: "Your profile has been updated successfully." });
    }
  }, [profileState]);
  const [uploadState, uploadAction, uploadPending] = useActionState(uploadDocument, { error: "" });
  const [, addSkillAction, addSkillPending] = useActionState(addCandidateSkill, { error: "" });
  const [, removeSkillAction, removeSkillPending] = useActionState(removeCandidateSkill, { error: "" });
  const [, addExpAction, addExpPending] = useActionState(addCandidateExperience, { error: "" });
  const [, removeExpAction, removeExpPending] = useActionState(removeCandidateExperience, { error: "" });
  const [certState, addCertAction, addCertPending] = useActionState(addCandidateCertificate, { error: "" });
  const [, removeCertAction, removeCertPending] = useActionState(removeCandidateCertificate, { error: "" });
  const [addEduState, addEduAction, addEduPending] = useActionState(addCandidateEducation, { success: false } as EducationState);
  const [removeEduState, removeEduAction, removeEduPending] = useActionState(removeCandidateEducation, { success: false } as EducationState);
  const [addLangState, addLangAction, addLangPending] = useActionState<LanguageState, FormData>(addCandidateLanguage, { success: false } as LanguageState);
  const [removeLangState, removeLangAction, removeLangPending] = useActionState<LanguageState, FormData>(removeCandidateLanguage, { success: false } as LanguageState);

  useEffect(() => {
    if (addEduState.success) { toast.success("Education added", { description: "Your education entry has been added." }); }
  }, [addEduState]);
  useEffect(() => {
    if (removeEduState.success) { toast.success("Education removed", { description: "The education entry has been removed." }); }
  }, [removeEduState]);
  useEffect(() => {
    if (addLangState.success) { toast.success("Language added", { description: "Your language has been added." }); }
  }, [addLangState]);
  useEffect(() => {
    if (removeLangState.success) { toast.success("Language removed", { description: "The language entry has been removed." }); }
  }, [removeLangState]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      {/* Personal Info */}
      <FormSection title="Personal info">
        <form action={profileAction} className="space-y-4">
          <FieldRow label="Name (English)">
            <Input name="name" defaultValue={candidate.name} required />
            <FieldError errors={profileState.fieldErrors?.name} />
          </FieldRow>
          <FieldRow label="Name (Arabic)">
            <Input name="nameAr" defaultValue={candidate.nameAr} />
            <FieldError errors={profileState.fieldErrors?.nameAr} />
          </FieldRow>
          <FieldRow label="Email">
            <Input name="email" type="email" defaultValue={candidate.email} />
            <FieldError errors={profileState.fieldErrors?.email} />
          </FieldRow>
          <FieldRow label="Phone">
            <Input name="phone" type="tel" defaultValue={candidate.phone} />
            <FieldError errors={profileState.fieldErrors?.phone} />
          </FieldRow>
          <FieldRow label="Birth date">
            <Input name="birthDate" type="date" defaultValue={candidate.birthDate} />
            <FieldError errors={profileState.fieldErrors?.birthDate} />
          </FieldRow>

          <Separator />
          <h3 className="text-sm font-semibold text-muted-foreground">Location & education</h3>

          <FieldRow label="Country / Nationality">
            <Select
              name="countryId"
              defaultValue={candidate.countryId != null ? String(candidate.countryId) : "__none__"}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Not set —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Not set —</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={profileState.fieldErrors?.countryId} />
          </FieldRow>
          <FieldRow label="University">
            <Select
              name="universityId"
              defaultValue={candidate.universityId != null ? String(candidate.universityId) : "__none__"}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Not set —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Not set —</SelectItem>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={profileState.fieldErrors?.universityId} />
          </FieldRow>
          <FieldRow label="Address">
            <Textarea name="address" rows={2} defaultValue={candidate.address} />
            <FieldError errors={profileState.fieldErrors?.address} />
          </FieldRow>

          <Separator />
          <h3 className="text-sm font-semibold text-muted-foreground">Bank info</h3>

          <FieldRow label="Bank">
            <Select
              name="bankId"
              defaultValue={candidate.bankId != null ? String(candidate.bankId) : "__none__"}
            >
              <SelectTrigger>
                <SelectValue placeholder="— Not set —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Not set —</SelectItem>
                {banks.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={profileState.fieldErrors?.bankId} />
          </FieldRow>
          <FieldRow label="Account holder name">
            <Input name="bankAccountName" defaultValue={candidate.bankAccountName} />
            <FieldError errors={profileState.fieldErrors?.bankAccountName} />
          </FieldRow>
          <FieldRow label="IBAN">
            <Input name="iban" defaultValue={candidate.iban} />
            <FieldError errors={profileState.fieldErrors?.iban} />
          </FieldRow>

          <Separator />
          <h3 className="text-sm font-semibold text-muted-foreground">Profile details</h3>

          <FieldRow label="Civil ID">
            <Input name="civilId" defaultValue={candidate.civilId} />
            <FieldError errors={profileState.fieldErrors?.civilId} />
          </FieldRow>
          <FieldRow label="Objective / Headline">
            <Input name="objective" defaultValue={candidate.objective} />
            <FieldError errors={profileState.fieldErrors?.objective} />
          </FieldRow>
          <FieldRow label="Profile URL">
            <Input name="profileUrl" type="url" defaultValue={candidate.profileUrl} />
            <FieldError errors={profileState.fieldErrors?.profileUrl} />
          </FieldRow>
          <FieldRow label="About / Intro">
            <Textarea name="intro" rows={5} defaultValue={candidate.intro} />
            <FieldError errors={profileState.fieldErrors?.intro} />
          </FieldRow>
          <FormActions>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving..." : "Save profile"}
            </Button>
          </FormActions>
        </form>
      </FormSection>

      {/* Documents */}
      <FormSection title="Documents">
        <form action={uploadAction} className="space-y-4">
          {uploadState.error ? (
            <p className="text-sm text-destructive">{uploadState.error}</p>
          ) : null}
          <DocumentUpload label="Profile photo" type="photo" current={candidate.personalPhoto} />
          <DocumentUpload label="CV / Resume" type="cv" current={candidate.resume} />
          <DocumentUpload label="Video" type="video" current={candidate.video} />
          <DocumentUpload label="Civil ID (front)" type="civilFront" current={candidate.civilPhotoFront} />
          <DocumentUpload label="Civil ID (back)" type="civilBack" current={candidate.civilPhotoBack} />
          <FormActions>
            <Button type="submit" disabled={uploadPending}>
              {uploadPending ? "Uploading..." : "Upload document"}
            </Button>
          </FormActions>
        </form>
      </FormSection>

      {/* Skills */}
      <FormSection title="Skills">
        <form action={addSkillAction} className="space-y-4">
          <ListView isEmpty={skills.length === 0} empty="No skills added yet.">
            {skills.map((s) => (
              <EditableItem key={s.id} onRemove={null}>
                {s.title}
              </EditableItem>
            ))}
          </ListView>
          <FieldRow label="Add skill">
            <Input name="skill" placeholder="e.g. Cashier, Barista, Driver..." />
          </FieldRow>
          <FormActions>
            <Button type="submit" disabled={addSkillPending}>
              {addSkillPending ? "Adding..." : "Add skill"}
            </Button>
          </FormActions>
        </form>
      </FormSection>

      {/* Work Experience */}
      <FormSection title="Work experience">
        <form action={addExpAction} className="space-y-4">
          <ListView isEmpty={experiences.length === 0} empty="No work experience added yet.">
            {experiences.map((e) => (
              <EditableItem key={e.id} onRemove={null}>
                {e.title}{e.subtitle ? ` at ${e.subtitle}` : ""}
              </EditableItem>
            ))}
          </ListView>
          <FieldRow label="Job title / Role">
            <Input name="experience" placeholder="e.g. Sales Associate" required />
          </FieldRow>
          <FieldRow label="Employer / Company">
            <Input name="employer" placeholder="e.g. Alshaya" />
          </FieldRow>
          <InlineFields>
            <FieldRow label="Start year">
              <Input name="startYear" type="number" min={1950} max={2035} />
            </FieldRow>
            <FieldRow label="End year">
              <Input name="endYear" type="number" min={1950} max={2035} />
            </FieldRow>
          </InlineFields>
          <FormActions>
            <Button type="submit" disabled={addExpPending}>
              {addExpPending ? "Adding..." : "Add experience"}
            </Button>
          </FormActions>
        </form>
      </FormSection>

      {/* Certificates */}
      <FormSection title="Certificates">
        <form action={addCertAction} className="space-y-4">
          <ListView isEmpty={certificates.length === 0} empty="No certificates added yet.">
            {certificates.map((c) => (
              <EditableItem key={c.id} onRemove={null}>
                {c.title}{c.subtitle ? ` — ${c.subtitle}` : ""}
              </EditableItem>
            ))}
          </ListView>
          <FieldRow label="Certificate type">
            <Select name="certificate_type" defaultValue="false">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Training Certificate</SelectItem>
                <SelectItem value="true">Experience Certificate</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Certificate title">
            <Input name="certificate_title" placeholder="e.g. AWS Cloud Practitioner" required />
          </FieldRow>
          <FieldRow label="Issuer / Organization">
            <Input name="certificate_issuer" placeholder="e.g. Amazon Web Services" />
          </FieldRow>
          <InlineFields>
            <FieldRow label="Date obtained">
              <Input name="start_date" type="date" />
            </FieldRow>
            <FieldRow label="Expiry date">
              <Input name="end_date" type="date" />
            </FieldRow>
          </InlineFields>
          <FieldRow label="Certificate URL">
            <Input name="certificate_url" type="url" placeholder="https://example.com/cert/123" />
          </FieldRow>
          {certState.error ? <p className="text-sm text-destructive">{certState.error}</p> : null}
          <FormActions>
            <Button type="submit" disabled={addCertPending}>
              {addCertPending ? "Adding..." : "Add certificate"}
            </Button>
          </FormActions>
        </form>
      </FormSection>

      {/* Languages */}
      <FormSection title="Languages">
        <form action={addLangAction} className="space-y-4">
          <ListView isEmpty={languages.length === 0} empty="No languages added yet.">
            {languages.map((l) => (
              <EditableItem key={l.id} onRemove={null}>
                {l.title} <Badge variant="outline" className="ml-1 text-xs">{l.subtitle}</Badge>
              </EditableItem>
            ))}
          </ListView>
          <FieldRow label="Language">
            <Select name="language" required>
              <SelectTrigger>
                <SelectValue placeholder="— Select language —" />
              </SelectTrigger>
              <SelectContent>
                {["Arabic","English","French","Spanish","Portuguese","German","Italian","Dutch","Russian","Turkish","Persian","Urdu","Hindi","Bengali","Punjabi","Japanese","Korean","Chinese","Tagalog","Vietnamese","Thai","Malay","Indonesian","Swahili","Amharic","Somali","Greek"].map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Proficiency">
            <Select name="proficiency" required>
              <SelectTrigger>
                <SelectValue placeholder="— Select level —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="native">Native</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          {addLangState.error ? <p className="text-sm text-destructive">{addLangState.error}</p> : null}
          <FormActions>
            <Button type="submit" disabled={addLangPending}>
              {addLangPending ? "Adding..." : "Add language"}
            </Button>
          </FormActions>
        </form>
      </FormSection>

      {/* Education */}
      <FormSection title="Education">
        <form action={addEduAction} className="space-y-4">
          <ListView isEmpty={educationEntries.length === 0} empty="No education entries added yet.">
            {educationEntries.map((e) => (
              <EditableItem key={e.id} onRemove={null}>
                {e.universityLabel}{e.degreeLabel ? ` · ${e.degreeLabel}` : ""}{e.majorLabel ? ` · ${e.majorLabel}` : ""}{e.graduationYear ? ` (${e.graduationYear})` : ""}{e.isCurrentlyStudying ? " · Currently studying" : ""}
              </EditableItem>
            ))}
          </ListView>
          <FieldRow label="University">
            <Select name="universityId" required>
              <SelectTrigger>
                <SelectValue placeholder="— Select university —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Not set —</SelectItem>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Degree">
            <Select name="degreeUuid">
              <SelectTrigger>
                <SelectValue placeholder="— None —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— None —</SelectItem>
                {degrees.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Major">
            <Select name="majorUuid">
              <SelectTrigger>
                <SelectValue placeholder="— None —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— None —</SelectItem>
                {majors.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <InlineFields>
            <FieldRow label="Graduation year">
              <Input name="graduationYear" type="number" min={1950} max={2035} />
            </FieldRow>
            <div className="flex items-end gap-2 pb-2.5">
              <Checkbox id="isCurrentlyStudying" name="isCurrentlyStudying" value="1" />
              <Label htmlFor="isCurrentlyStudying">Currently studying</Label>
            </div>
          </InlineFields>
          {addEduState.error ? <p className="text-sm text-destructive">{addEduState.error}</p> : null}
          <FormActions>
            <Button type="submit" disabled={addEduPending}>
              {addEduPending ? "Adding..." : "Add education"}
            </Button>
          </FormActions>
        </form>
      </FormSection>
    </div>
  );
}
