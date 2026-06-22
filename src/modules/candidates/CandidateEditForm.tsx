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
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const formSection =
  "grid gap-1.5";

export function CandidateEditForm({
  candidate, countries, universities, banks, skills, experiences,
  certificates, languages, educationEntries, degrees, majors,
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
    <div className="grid gap-6">
      {/* Personal info */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Personal info</h2>
          <form action={profileAction} className="grid gap-4">
            <div className={formSection}>
              <Label htmlFor="name">Name (English)</Label>
              <Input id="name" name="name" defaultValue={candidate.name} required />
              <FieldError errors={profileState.fieldErrors?.name} />
            </div>
            <div className={formSection}>
              <Label htmlFor="nameAr">Name (Arabic)</Label>
              <Input id="nameAr" name="nameAr" defaultValue={candidate.nameAr} />
              <FieldError errors={profileState.fieldErrors?.nameAr} />
            </div>
            <div className={formSection}>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={candidate.email} />
              <FieldError errors={profileState.fieldErrors?.email} />
            </div>
            <div className={formSection}>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={candidate.phone} />
              <FieldError errors={profileState.fieldErrors?.phone} />
            </div>
            <div className={formSection}>
              <Label htmlFor="birthDate">Birth date</Label>
              <Input id="birthDate" name="birthDate" type="date" defaultValue={candidate.birthDate} />
              <FieldError errors={profileState.fieldErrors?.birthDate} />
            </div>
            <h2 className="text-lg font-semibold m-0 pt-2">Location & education</h2>
            <div className={formSection}>
              <Label htmlFor="countryId">Country / Nationality</Label>
              <select id="countryId" name="countryId" defaultValue={candidate.countryId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">— Not set —</option>
                {countries.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
              </select>
              <FieldError errors={profileState.fieldErrors?.countryId} />
            </div>
            <div className={formSection}>
              <Label htmlFor="universityId">University</Label>
              <select id="universityId" name="universityId" defaultValue={candidate.universityId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">— Not set —</option>
                {universities.map((u) => (<option key={u.id} value={u.id}>{u.label}</option>))}
              </select>
              <FieldError errors={profileState.fieldErrors?.universityId} />
            </div>
            <div className={formSection}>
              <Label htmlFor="address">Address</Label>
              <textarea id="address" name="address" rows={2} defaultValue={candidate.address}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              <FieldError errors={profileState.fieldErrors?.address} />
            </div>
            <h2 className="text-lg font-semibold m-0 pt-2">Bank info</h2>
            <div className={formSection}>
              <Label htmlFor="bankId">Bank</Label>
              <select id="bankId" name="bankId" defaultValue={candidate.bankId ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">— Not set —</option>
                {banks.map((b) => (<option key={b.id} value={b.id}>{b.label}</option>))}
              </select>
              <FieldError errors={profileState.fieldErrors?.bankId} />
            </div>
            <div className={formSection}>
              <Label htmlFor="bankAccountName">Account holder name</Label>
              <Input id="bankAccountName" name="bankAccountName" defaultValue={candidate.bankAccountName} />
              <FieldError errors={profileState.fieldErrors?.bankAccountName} />
            </div>
            <div className={formSection}>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" defaultValue={candidate.iban} />
              <FieldError errors={profileState.fieldErrors?.iban} />
            </div>
            <h2 className="text-lg font-semibold m-0 pt-2">Profile details</h2>
            <div className={formSection}>
              <Label htmlFor="civilId">Civil ID</Label>
              <Input id="civilId" name="civilId" defaultValue={candidate.civilId} />
              <FieldError errors={profileState.fieldErrors?.civilId} />
            </div>
            <div className={formSection}>
              <Label htmlFor="objective">Objective / Headline</Label>
              <Input id="objective" name="objective" defaultValue={candidate.objective} />
              <FieldError errors={profileState.fieldErrors?.objective} />
            </div>
            <div className={formSection}>
              <Label htmlFor="profileUrl">Profile URL</Label>
              <Input id="profileUrl" name="profileUrl" type="url" defaultValue={candidate.profileUrl} />
              <FieldError errors={profileState.fieldErrors?.profileUrl} />
            </div>
            <div className={formSection}>
              <Label htmlFor="intro">About / Intro</Label>
              <textarea id="intro" name="intro" rows={5} defaultValue={candidate.intro}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              <FieldError errors={profileState.fieldErrors?.intro} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={profilePending}>
                {profilePending ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Documents</h2>
          <form action={uploadAction} className="grid gap-4">
            {uploadState.error ? (
              <p className="text-sm text-destructive font-medium">{uploadState.error}</p>
            ) : null}
            <DocumentUpload label="Profile photo" type="photo" current={candidate.personalPhoto} />
            <DocumentUpload label="CV / Resume" type="cv" current={candidate.resume} />
            <DocumentUpload label="Video" type="video" current={candidate.video} />
            <DocumentUpload label="Civil ID (front)" type="civilFront" current={candidate.civilPhotoFront} />
            <DocumentUpload label="Civil ID (back)" type="civilBack" current={candidate.civilPhotoBack} />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={uploadPending}>
                {uploadPending ? "Uploading..." : "Upload document"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Skills</h2>
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.id} className="inline-flex items-center gap-1.5">
                  <Badge variant="secondary">{s.title}</Badge>
                  <form id={`remove-skill-${s.id}`} action={removeSkillAction} className="inline">
                    <input type="hidden" name="skillId" value={s.id} />
                    <Button type="submit" variant="ghost" size="sm" disabled={removeSkillPending} className="h-6 px-1 text-xs text-destructive hover:text-destructive">
                      ✕
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground m-0">No skills added yet.</p>
          )}
          <form action={addSkillAction} className="grid gap-3">
            <div className={formSection}>
              <Label htmlFor="skill">Add skill</Label>
              <Input id="skill" name="skill" placeholder="e.g. Cashier, Barista, Driver..." />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addSkillPending}>
                {addSkillPending ? "Adding..." : "Add skill"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Work experience */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Work experience</h2>
          {experiences.length ? (
            <div className="grid gap-2">
              {experiences.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                  <span className="text-sm">{e.title}{e.subtitle ? ` at ${e.subtitle}` : ""}</span>
                  <form id={`remove-exp-${e.id}`} action={removeExpAction} className="inline">
                    <input type="hidden" name="experienceId" value={e.id} />
                    <Button type="submit" variant="ghost" size="sm" disabled={removeExpPending} className="text-destructive hover:text-destructive h-7">
                      Remove
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground m-0">No work experience added yet.</p>
          )}
          <form action={addExpAction} className="grid gap-3">
            <div className={formSection}>
              <Label htmlFor="experience">Job title / Role</Label>
              <Input id="experience" name="experience" placeholder="e.g. Sales Associate" required />
            </div>
            <div className={formSection}>
              <Label htmlFor="employer">Employer / Company</Label>
              <Input id="employer" name="employer" placeholder="e.g. Alshaya" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={formSection}>
                <Label htmlFor="startYear">Start year</Label>
                <Input id="startYear" name="startYear" type="number" min="1950" max="2035" />
              </div>
              <div className={formSection}>
                <Label htmlFor="endYear">End year</Label>
                <Input id="endYear" name="endYear" type="number" min="1950" max="2035" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={addExpPending}>
                {addExpPending ? "Adding..." : "Add experience"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Certificates</h2>
          {certificates.length ? (
            <div className="grid gap-2">
              {certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                  <span className="text-sm">{c.title}{c.subtitle ? ` — ${c.subtitle}` : ""}</span>
                  <form id={`remove-cert-${c.id}`} action={removeCertAction} className="inline">
                    <input type="hidden" name="certificateUuid" value={c.id} />
                    <Button type="submit" variant="ghost" size="sm" disabled={removeCertPending} className="text-destructive hover:text-destructive h-7">
                      Remove
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground m-0">No certificates added yet.</p>
          )}
          <form action={addCertAction} className="grid gap-3">
            <div className={formSection}>
              <Label htmlFor="certificate_type">Certificate type</Label>
              <select id="certificate_type" name="certificate_type" required defaultValue="false"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="false">Training Certificate</option>
                <option value="true">Experience Certificate</option>
              </select>
            </div>
            <div className={formSection}>
              <Label htmlFor="certificate_title">Certificate title</Label>
              <Input id="certificate_title" name="certificate_title" placeholder="e.g. AWS Cloud Practitioner" required />
            </div>
            <div className={formSection}>
              <Label htmlFor="certificate_issuer">Issuer / Organization</Label>
              <Input id="certificate_issuer" name="certificate_issuer" placeholder="e.g. Amazon Web Services" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={formSection}>
                <Label htmlFor="start_date">Date obtained</Label>
                <Input id="start_date" name="start_date" type="date" />
              </div>
              <div className={formSection}>
                <Label htmlFor="end_date">Expiry date</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>
            </div>
            <div className={formSection}>
              <Label htmlFor="certificate_url">Certificate URL</Label>
              <Input id="certificate_url" name="certificate_url" type="url" placeholder="https://example.com/cert/123" />
            </div>
            {certState.error ? (
              <p className="text-sm text-destructive font-medium">{certState.error}</p>
            ) : null}
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={addCertPending}>
                {addCertPending ? "Adding..." : "Add certificate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Languages</h2>
          {languages.length ? (
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <div key={l.id} className="inline-flex items-center gap-1.5">
                  <Badge variant="outline" className="gap-1.5">
                    {l.title}
                    <span className="text-xs text-muted-foreground">{l.subtitle}</span>
                  </Badge>
                  <form id={`remove-lang-${l.id}`} action={removeLangAction} className="inline">
                    <input type="hidden" name="languageId" value={l.id} />
                    <Button type="submit" variant="ghost" size="sm" disabled={removeLangPending} className="h-6 px-1 text-xs text-destructive hover:text-destructive">
                      ✕
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground m-0">No languages added yet.</p>
          )}
          <form action={addLangAction} className="grid gap-3">
            <div className={formSection}>
              <Label htmlFor="language">Language</Label>
              <select id="language" name="language" required defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="" disabled>— Select language —</option>
                {["Arabic","English","French","Spanish","Portuguese","German","Italian","Dutch","Russian","Turkish","Persian","Urdu","Hindi","Bengali","Punjabi","Japanese","Korean","Chinese","Tagalog","Vietnamese","Thai","Malay","Indonesian","Swahili","Amharic","Somali","Greek"].map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className={formSection}>
              <Label htmlFor="proficiency">Proficiency</Label>
              <select id="proficiency" name="proficiency" required defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="" disabled>— Select level —</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="native">Native</option>
              </select>
            </div>
            {addLangState.error ? (
              <p className="text-sm text-destructive font-medium">{addLangState.error}</p>
            ) : null}
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={addLangPending}>
                {addLangPending ? "Adding..." : "Add language"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardContent className="grid gap-4 p-5">
          <h2 className="text-lg font-semibold m-0">Education</h2>
          {educationEntries.length ? (
            <div className="grid gap-2">
              {educationEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                  <span className="text-sm">
                    {e.universityLabel}
                    {e.degreeLabel ? ` · ${e.degreeLabel}` : ""}
                    {e.majorLabel ? ` · ${e.majorLabel}` : ""}
                    {e.graduationYear ? ` (${e.graduationYear})` : ""}
                    {e.isCurrentlyStudying ? " · Currently studying" : ""}
                  </span>
                  <form id={`remove-edu-${e.id}`} action={removeEduAction} className="inline">
                    <input type="hidden" name="educationUuid" value={e.id} />
                    <Button type="submit" variant="ghost" size="sm" disabled={removeEduPending} className="text-destructive hover:text-destructive h-7">
                      Remove
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground m-0">No education entries added yet.</p>
          )}
          <form action={addEduAction} className="grid gap-3">
            <div className={formSection}>
              <Label htmlFor="addEduUniversityId">University</Label>
              <select id="addEduUniversityId" name="universityId" required defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="" disabled>— Select university —</option>
                {universities.map((u) => (<option key={u.id} value={u.id}>{u.label}</option>))}
              </select>
            </div>
            <div className={formSection}>
              <Label htmlFor="addEduDegreeUuid">Degree</Label>
              <select id="addEduDegreeUuid" name="degreeUuid" defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">— None —</option>
                {degrees.map((d) => (<option key={d.id} value={d.id}>{d.label}</option>))}
              </select>
            </div>
            <div className={formSection}>
              <Label htmlFor="addEduMajorUuid">Major</Label>
              <select id="addEduMajorUuid" name="majorUuid" defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">— None —</option>
                {majors.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={formSection}>
                <Label htmlFor="graduationYear">Graduation year</Label>
                <Input id="graduationYear" name="graduationYear" type="number" min="1950" max="2035" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input name="isCurrentlyStudying" type="checkbox" value="1" className="size-4 rounded border border-input accent-blue-zendesk" />
                  <span>Currently studying</span>
                </label>
              </div>
            </div>
            {addEduState.error ? (
              <p className="text-sm text-destructive font-medium">{addEduState.error}</p>
            ) : null}
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={addEduPending}>
                {addEduPending ? "Adding..." : "Add education"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentUpload({ label, type, current }: { label: string; type: string; current: string | null }) {
  return (
    <fieldset className="rounded-md border border-border p-3 grid gap-2">
      <legend className="text-sm font-medium text-muted-foreground px-1">{label}</legend>
      <input type="hidden" name="type" value={type} />
      <Input type="file" name={`file_${type}`} accept={acceptFor(type)} className="file:mr-3" />
      {current ? (
        <small className="text-xs text-muted-foreground">
          Current: <a href={current} target="_blank" rel="noreferrer" className="underline underline-offset-2 text-blue-zendesk">
            {current.split("/").pop()}
          </a>
        </small>
      ) : (
        <small className="text-xs text-muted-foreground">No file uploaded yet.</small>
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

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? (
    <p className="text-sm text-destructive font-medium m-0">{errors[0]}</p>
  ) : null;
}
