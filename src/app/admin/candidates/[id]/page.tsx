import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireCapability } from "@/modules/auth/session";
import { getCandidateDetail } from "@/modules/admin/candidates/[id]";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCapability("candidate.read");
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    redirect("/admin/candidates");
  }

  const detail = await getCandidateDetail(candidateId);

  if (!detail.candidate) {
    notFound();
  }

  const c = detail.candidate;

  function statusBadge(status: number) {
    switch (status) {
      case 10: return <Badge className="bg-green-600">Active</Badge>;
      case 20: return <Badge variant="secondary">Inactive</Badge>;
      case 30: return <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/80">Banned</Badge>;
      default: return <Badge variant="outline">{`Status ${status}`}</Badge>;
    }
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Candidates"
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
                {statusBadge(c.candidate_status)}
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
        </CardContent>
      </Card>

      {/* ── Detail Tabs ──────────────────────────────────────── */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* ── Tab: Details ──────────────────────────────────── */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection
              title="Personal Info"
              facts={[
                { label: "Email", value: c.candidate_email },
                { label: "Phone", value: c.candidate_phone },
                { label: "Gender", value: c.candidate_gender === 1 ? "Male" : c.candidate_gender === 2 ? "Female" : null },
                { label: "Birth date", value: c.candidate_birth_date ? String(c.candidate_birth_date).split("T")[0] : null },
                { label: "Hourly rate", value: c.candidate_hourly_rate ? `${c.candidate_hourly_rate} ${c.currency_code ?? "KWD"}/hr` : null },
                { label: "Store", value: c.store?.store_name },
                { label: "University", value: c.university?.university_name_en },
                { label: "Objective", value: c.candidate_objective },
              ]}
            />
            <DetailSection
              title="Record"
              facts={[
                { label: "Candidate ID", value: String(c.candidate_id) },
                { label: "Arabic name", value: c.candidate_name_ar },
                { label: "Created", value: c.candidate_created_at ? String(c.candidate_created_at).split("T")[0] : null },
                { label: "Updated", value: c.candidate_updated_at ? String(c.candidate_updated_at).split("T")[0] : null },
              ]}
            />
          </div>
        </TabsContent>

        {/* ── Tab: Placements ────────────────────────────────── */}
        <TabsContent value="placements" className="space-y-4">
          {detail.placements.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Placements ({detail.placements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.placements.map((p) => (
                    <div
                      key={p.transfer_id}
                      className="text-sm py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.company_name ?? "Unnamed"}</span>
                        <Badge variant={p.paid ? "default" : "secondary"}>
                          {p.paid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-0.5">
                        {p.store_name ? `${p.store_name} · ` : ""}
                        {p.period}
                        {p.hours ? ` · ${p.hours}h` : ""}
                        {p.amount ? ` · ${p.amount}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">No placements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This candidate has no placement history.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab: Documents ────────────────────────────────── */}
        <TabsContent value="documents" className="space-y-4">
          {detail.documents.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="size-4" />
                  Documents ({detail.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detail.documents.map((doc) => (
                    <div
                      key={doc.type}
                      className="text-sm py-2 border-b border-border last:border-0 flex items-center justify-between"
                    >
                      <span className="font-medium">{doc.label}</span>
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">Missing</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">No documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No documents (resume, civil ID, or photos) on file.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <section className="flex gap-2 p-4">
        <Link href={"/admin/candidates" as Route}>
          <Button variant="outline">Back to Candidates</Button>
        </Link>
      </section>
    </WorkspaceShell>
  );
}
