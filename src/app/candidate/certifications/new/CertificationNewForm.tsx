"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createCertification } from "./actions";
import type { CertificationActionResult } from "./actions";

export function CertificationNewForm() {
  const router = useRouter();
  const [certificationName, setCertificationName] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result: CertificationActionResult = await createCertification({
      certificationName,
      issuingOrganization,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      credentialId: credentialId || undefined,
      credentialUrl: credentialUrl || undefined,
      description: description || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      router.push(`/candidate/certifications/${result.certificationId}`);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="certificationName" className="text-sm font-medium">
            Certification Name *
          </label>
          <input
            id="certificationName"
            type="text"
            value={certificationName}
            onChange={(e) => setCertificationName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            placeholder="e.g. PMP, AWS Solutions Architect"
            maxLength={255}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="issuingOrganization" className="text-sm font-medium">
            Issuing Organization *
          </label>
          <input
            id="issuingOrganization"
            type="text"
            value={issuingOrganization}
            onChange={(e) => setIssuingOrganization(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            placeholder="e.g. PMI, Amazon Web Services"
            maxLength={255}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="issueDate" className="text-sm font-medium">
            Issue Date
          </label>
          <input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expiryDate" className="text-sm font-medium">
            Expiry Date
          </label>
          <input
            id="expiryDate"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="credentialId" className="text-sm font-medium">
            Credential ID
          </label>
          <input
            id="credentialId"
            type="text"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            placeholder="e.g. AWS-12345"
            maxLength={128}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="credentialUrl" className="text-sm font-medium">
            Credential URL
          </label>
          <input
            id="credentialUrl"
            type="url"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            placeholder="https://..."
            maxLength={500}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 min-h-[100px] resize-y"
          placeholder="Optional notes about this certification..."
          maxLength={1000}
        />
        <p className="text-xs text-white/40">
          {description.length}/1000 characters
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || !certificationName.trim() || !issuingOrganization.trim()}>
          {submitting ? "Adding..." : "Add Certification"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/candidate/certifications")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
