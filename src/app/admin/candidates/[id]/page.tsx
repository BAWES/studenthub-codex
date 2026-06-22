import { notFound, redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/candidates/candidate-detail";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
} from "lucide-react";
import NextLink from "next/link";

export const dynamic = "force-dynamic";

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function SectionList({ items, emptyMessage }: { items: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[]; emptyMessage: string }) {
  if (!items.length) return <p className="text-muted-foreground text-sm p-4">{emptyMessage}</p>;
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between p-4 gap-4">
          <div className="min-w-0 flex-1">
            {item.href ? (
              <a href={item.href} className="text-sm font-medium hover:text-blue transition-colors">
                {item.title}
              </a>
            ) : (
              <p className="text-sm font-medium">{item.title}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
          </div>
          {item.meta ? (
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{item.meta}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default async function AdminCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRoleCapability("admin", "candidate.search");
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    redirect("/admin/candidates");
  }

  const detail = await getCandidateDetail(candidateId, "/admin/requests");

  if (!detail.candidate) {
    notFound();
  }

  const c = detail.candidate;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <NextLink href="/admin/candidates" className="hover:text-foreground transition-colors inline-flex items-center gap-1 no-underline">
          <ArrowLeft className="size-3.5" />
          Candidates
        </NextLink>
        <span>/</span>
        <span className="text-foreground font-medium">
          {c.candidate_name ?? `#${c.candidate_id}`}
        </span>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="size-7 text-primary" />
            </div>

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

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {detail.metrics.map((m) => (
              <div key={m.label} className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold mt-0.5">{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
          <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
          <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs">Invitations</TabsTrigger>
          <TabsTrigger value="applications" className="text-xs">Applications</TabsTrigger>
          <TabsTrigger value="interviews" className="text-xs">Interviews</TabsTrigger>
          <TabsTrigger value="work-hours" className="text-xs">Work Hours</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
          <TabsTrigger value="tags" className="text-xs">Tags</TabsTrigger>
          <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
          <TabsTrigger value="warnings" className="text-xs">Warnings</TabsTrigger>
          <TabsTrigger value="certificates" className="text-xs">Certificates</TabsTrigger>
          <TabsTrigger value="languages" className="text-xs">Languages</TabsTrigger>
          <TabsTrigger value="suggestions" className="text-xs">Suggestions</TabsTrigger>
          <TabsTrigger value="links" className="text-xs">Links</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={User} label="Name (EN)" value={c.candidate_name} />
              <InfoRow icon={User} label="Name (AR)" value={c.candidate_name_ar} />
              <InfoRow icon={Mail} label="Email" value={c.candidate_email} />
              <InfoRow icon={Phone} label="Phone" value={c.candidate_phone} />
              <InfoRow icon={MapPin} label="Country" value={c.country?.country_name_en} />
              <InfoRow icon={MapPin} label="Address" value={c.candidate_address_line1} />
              <InfoRow icon={GraduationCap} label="University" value={c.university?.university_name_en} />
              <InfoRow icon={Briefcase} label="Store" value={c.store?.store_name} />
              <InfoRow icon={Briefcase} label="Company" value={c.store?.company?.company_name} />
              <InfoRow icon={Star} label="UID" value={c.candidate_uid} />
              <InfoRow icon={Globe} label="Profile URL" value={c.profile_url} />
              <InfoRow icon={AlertTriangle} label="Civil ID Verification" value={c.candidate_civil_need_verification ? "Needed" : "Not needed"} />
              <InfoRow icon={Clock} label="Created" value={c.candidate_created_at ? new Date(c.candidate_created_at).toLocaleDateString() : null} />
              <InfoRow icon={Clock} label="Updated" value={c.candidate_updated_at ? new Date(c.candidate_updated_at).toLocaleDateString() : null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Education ({detail.education.length})</CardTitle></CardHeader>
            <SectionList items={detail.education} emptyMessage="No education records found." />
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Experience ({detail.experiences.length})</CardTitle></CardHeader>
            <SectionList items={detail.experiences} emptyMessage="No experience records found." />
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Invitations ({detail.invitations.length})</CardTitle></CardHeader>
            <SectionList items={detail.invitations} emptyMessage="No invitations found." />
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Applications ({detail.applications.length})</CardTitle></CardHeader>
            <SectionList items={detail.applications} emptyMessage="No applications found." />
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Interviews ({detail.interviews.length})</CardTitle></CardHeader>
            <SectionList items={detail.interviews} emptyMessage="No interviews found." />
          </Card>
        </TabsContent>

        <TabsContent value="work-hours" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Work Hours ({detail.workHours.length})</CardTitle></CardHeader>
            <SectionList items={detail.workHours} emptyMessage="No work hour records found." />
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Notes ({detail.notes.length})</CardTitle></CardHeader>
            <SectionList items={detail.notes} emptyMessage="No notes found." />
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tags ({detail.tags.length})</CardTitle></CardHeader>
            <SectionList items={detail.tags} emptyMessage="No tags found." />
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Skills ({detail.skills.length})</CardTitle></CardHeader>
            <SectionList items={detail.skills} emptyMessage="No skills found." />
          </Card>
        </TabsContent>

        <TabsContent value="warnings" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Warnings ({detail.warnings.length})</CardTitle></CardHeader>
            <SectionList items={detail.warnings} emptyMessage="No warnings found." />
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Certificates ({detail.certificates.length})</CardTitle></CardHeader>
            <SectionList items={detail.certificates} emptyMessage="No certificates found." />
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Languages ({detail.languages.length})</CardTitle></CardHeader>
            <SectionList items={detail.languages} emptyMessage="No languages found." />
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Suggestions ({detail.suggestions.length})</CardTitle></CardHeader>
            <SectionList items={detail.suggestions} emptyMessage="No suggestions found." />
          </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Links ({detail.links.length})</CardTitle></CardHeader>
            <SectionList items={detail.links} emptyMessage="No links found." />
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Finance</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold mt-1">{detail.stats?.totalRevenue ?? "N/A"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last updated {detail.stats?.updated ?? "N/A"}</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  <p className="text-xl font-bold mt-1">{detail.metrics[1]?.value ?? "N/A"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{detail.metrics[1]?.note}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
