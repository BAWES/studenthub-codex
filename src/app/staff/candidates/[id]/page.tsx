import { notFound, redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/candidates/candidate-detail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  Clock,
  AlertTriangle,
  LinkIcon,
  CreditCard,
  MessageSquare,
  Tag,
  Globe,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("staff", "candidate.search");
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    redirect("/staff/candidates");
  }

  const detail = await getCandidateDetail(candidateId, "/staff/requests");

  if (!detail.candidate) {
    notFound();
  }

  const c = detail.candidate;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Staff / Candidate"
      title={c.candidate_name ?? `#${c.candidate_id}`}
      metrics={detail.metrics}
    >

      {/* ── Profile Header ──────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-7 text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {c.candidate_name ?? "Unnamed"}
                </h1>
                <Badge variant={c.approved === 0 ? "secondary" : "default"}>
                  {c.approved === 0 ? "Needs review" : "Active"}
                </Badge>
                {c.candidate_job_search_status === 1 && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Job search
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-muted-foreground">
                {c.candidate_email ? (
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {c.candidate_email}
                  </span>
                ) : null}
                {c.candidate_phone ? (
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {c.candidate_phone}
                  </span>
                ) : null}
                {c.country?.country_name_en ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {c.country.country_name_en}
                  </span>
                ) : null}
              </div>

            </div>
          </div>

          {/* Bio */}
          {c.candidate_objective || c.candidate_intro ? (
            <div className="mt-4 space-y-2 max-w-2xl">
              {c.candidate_objective ? (
                <p className="text-sm text-foreground/80">{c.candidate_objective}</p>
              ) : null}
              {c.candidate_intro ? (
                <p className="text-sm text-muted-foreground">{c.candidate_intro}</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ── Detail Tabs ──────────────────────────────────────── */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="work">Work & Invitations</TabsTrigger>
          <TabsTrigger value="education">Education & Skills</TabsTrigger>
          <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* ── Tab: Details ──────────────────────────────────── */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DetailRow label="Gender" value={c.candidate_gender === 1 ? "Male" : c.candidate_gender === 2 ? "Female" : null} />
                <DetailRow label="Birth date" value={c.candidate_birth_date ? String(c.candidate_birth_date).split("T")[0] : null} />
                <DetailRow label="Civil ID" value={c.candidate_civil_id} />
                <DetailRow label="Driving license" value={c.candidate_driving_license == null ? null : c.candidate_driving_license ? "Yes" : "No"} />
                <DetailRow label="Preferred time" value={c.candidate_preferred_time} />
                <DetailRow
                  label="Rate"
                  value={
                    c.candidate_hourly_rate != null
                      ? `${c.candidate_hourly_rate} ${c.currency_code ?? "KWD"}/hr`
                      : null
                  }
                />
                <DetailRow label="Store" value={c.store?.store_name ?? null} />
                {c.store?.company?.company_name ? (
                  <DetailRow label="Company" value={c.store.company.company_name} />
                ) : null}
              </CardContent>
            </Card>

            {/* Financial */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Financial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DetailRow label="Bank account" value={c.bank_account_name} />
                <DetailRow label="IBAN" value={c.candidate_iban} />
                <DetailRow label="Profile URL" value={c.profile_url} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Work & Invitations ───────────────────────── */}
        <TabsContent value="work" className="space-y-4">
          {detail.invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-4" />
                  Invitations ({detail.invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.invitations.map((inv) => (
                    <div key={inv.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{inv.title}</div>
                      <div className="text-muted-foreground">{inv.subtitle} · {inv.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.histories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4" />
                  Work History ({detail.histories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.histories.map((h) => (
                    <div key={h.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{h.title}</div>
                      <div className="text-muted-foreground">{h.subtitle} · {h.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.workHours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4" />
                  Work Logs ({detail.workHours.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.workHours.map((wh) => (
                    <div key={wh.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{wh.title}</div>
                      <div className="text-muted-foreground">{wh.subtitle} · {wh.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.interviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Interviews ({detail.interviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.interviews.map((iv) => (
                    <div key={iv.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{iv.title}</div>
                      <div className="text-muted-foreground">{iv.subtitle} · {iv.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="size-4" />
                  Suggestions ({detail.suggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.suggestions.map((s) => (
                    <div key={s.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{s.title}</div>
                      <div className="text-muted-foreground">{s.subtitle} · {s.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab: Education & Skills ─────────────────────────── */}
        <TabsContent value="education" className="space-y-4">
          {detail.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="size-4" />
                  Education ({detail.education.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.education.map((edu) => (
                    <div key={edu.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{edu.title}</div>
                      <div className="text-muted-foreground">{edu.subtitle} · {edu.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="size-4" />
                  Skills ({detail.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detail.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="size-4" />
                  Languages ({detail.languages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.languages.map((lang) => (
                    <div key={lang.id} className="text-sm py-1 border-b border-border last:border-0 flex justify-between">
                      <span className="font-medium">{lang.title}</span>
                      <span className="text-muted-foreground">{lang.subtitle}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Experience ({detail.experiences.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.experiences.map((exp) => (
                    <div key={exp.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-muted-foreground">{exp.subtitle} · {exp.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  Certificates ({detail.certificates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.certificates.map((cert) => (
                    <div key={cert.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{cert.title}</div>
                      <div className="text-muted-foreground">{cert.subtitle} · {cert.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab: Notes & Tags ─────────────────────────────── */}
        <TabsContent value="notes" className="space-y-4">
          {detail.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Notes ({detail.notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.notes.map((note) => (
                    <div key={note.id} className="text-sm p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {note.title}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">{note.meta}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{note.subtitle}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="size-4" />
                  Tags ({detail.tags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.tags.map((tag) => (
                    <div key={tag.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{tag.title}</div>
                      <div className="text-muted-foreground">{tag.subtitle} · {tag.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4" />
                  Warnings ({detail.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.warnings.map((w) => (
                    <div key={w.id} className="text-sm p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="font-medium text-destructive">{w.title}</div>
                      <div className="text-muted-foreground mt-0.5">{w.subtitle}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{w.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab: Documents ────────────────────────────────── */}
        <TabsContent value="documents" className="space-y-4">
          {detail.links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LinkIcon className="size-4" />
                  Links ({detail.links.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.links.map((link) => (
                    <div key={link.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{link.title}</div>
                      <a href={link.href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {link.subtitle}
                      </a>
                      <div className="text-muted-foreground text-[11px]">{link.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.idCards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="size-4" />
                  ID Cards ({detail.idCards.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.idCards.map((card) => (
                    <div key={card.id} className="text-sm py-1.5 border-b border-border last:border-0">
                      <div className="font-medium">{card.title}</div>
                      <div className="text-muted-foreground">{card.subtitle} · {card.meta}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detail.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <DetailRow label="Total revenue" value={detail.stats.totalRevenue} />
                  <DetailRow label="Last updated" value={detail.stats.updated} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}
