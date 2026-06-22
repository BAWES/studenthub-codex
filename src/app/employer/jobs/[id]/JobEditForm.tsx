"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/modules/workspace/StatusBadge";
import { genericStatusVariant } from "@/modules/workspace/status-mapping";
import { updateJob, deleteJob } from "../actions";
import type { JobRow } from "../schemas";

type Props = {
  job: JobRow;
  readOnly: boolean;
};

function parseSalaryRange(salaryRange: string | null): [string, string] {
  if (!salaryRange) return ["", ""];
  const match = salaryRange.match(/KWD\s*([\d,]+)\s*—\s*([\d,]+)/);
  if (match) return [match[1].replace(/,/g, ""), match[2].replace(/,/g, "")];
  return [salaryRange.replace(/KWD\s*/g, ""), ""];
}

export function JobEditForm({ job, readOnly }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [requirements, setRequirements] = useState(job.requirements ?? "");
  const [location, setLocation] = useState(job.location ?? "");
  const [employmentType, setEmploymentType] = useState(job.employmentType ?? "full-time");
  const [status, setStatus] = useState(job.status ?? "active");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [salaryMin, salaryMax] = parseSalaryRange(job.salaryRange);
  const [salaryMinVal, setSalaryMinVal] = useState(salaryMin);
  const [salaryMaxVal, setSalaryMaxVal] = useState(salaryMax);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const salaryRange = salaryMinVal || salaryMaxVal
      ? `KWD ${salaryMinVal || "0"}${salaryMaxVal ? ` — ${salaryMaxVal}` : ""}`
      : undefined;

    try {
      await updateJob({
        jobId: job.jobListingId,
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        location: location.trim() || undefined,
        employmentType,
        salaryRange,
        status,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job posting");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this job posting? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteJob({ jobId: job.jobListingId });
      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job posting");
      setDeleting(false);
    }
  }

  const inputClass = readOnly
    ? "w-full rounded-lg border border-input/50 bg-card px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
    : "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30";
  const textareaClass = readOnly
    ? "w-full rounded-lg border border-input/50 bg-card px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed min-h-[80px]"
    : "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30 min-h-[80px]";
  const selectClass = readOnly
    ? "w-full rounded-lg border border-input/50 bg-card px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
    : "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Status badge header */}
      <div className="flex items-center gap-3">
        <StatusBadge variant={genericStatusVariant(status)} label={status} size="md" />
        <span className="text-xs text-muted-foreground">Posted: {new Date(job.createdAt).toLocaleDateString("en-KW")}</span>
        <span className="text-xs text-muted-foreground">Updated: {new Date(job.updatedAt).toLocaleDateString("en-KW")}</span>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Job Title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Software Engineer Intern"
          maxLength={255}
          required
          readOnly={readOnly}
          autoFocus={!readOnly}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={readOnly
            ? "w-full rounded-lg border border-input/50 bg-card px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed min-h-[120px]"
            : "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30 min-h-[120px]"}
          placeholder="Describe the role..."
          required
          readOnly={readOnly}
        />
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <label htmlFor="requirements" className="text-sm font-medium">
          Requirements
        </label>
        <textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className={textareaClass}
          placeholder="Required skills, experience..."
          readOnly={readOnly}
        />
      </div>

      {/* Location & Employment Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            placeholder="Kuwait City"
            readOnly={readOnly}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="employmentType" className="text-sm font-medium">
            Employment Type
          </label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className={selectClass}
            disabled={readOnly}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
      </div>

      {/* Salary Range (KWD) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Salary Range (KWD/month)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              id="salaryMin"
              type="number"
              value={salaryMinVal}
              onChange={(e) => setSalaryMinVal(e.target.value)}
              className={inputClass}
              placeholder="Min"
              min={0}
              readOnly={readOnly}
            />
          </div>
          <div>
            <input
              id="salaryMax"
              type="number"
              value={salaryMaxVal}
              onChange={(e) => setSalaryMaxVal(e.target.value)}
              className={inputClass}
              placeholder="Max"
              min={0}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClass}
          disabled={readOnly}
        >
          <option value="active">Active (visible to candidates)</option>
          <option value="draft">Draft (not visible)</option>
          <option value="closed">Closed (no longer accepting)</option>
          <option value="filled">Filled (position filled)</option>
        </select>
      </div>

      {/* Buttons */}
      {!readOnly && (
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button type="submit" disabled={submitting || !title.trim() || !description.trim()}>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/employer/jobs")}
          >
            Back to Jobs
          </Button>
          <div className="flex-1" />
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )}
    </form>
  );
}
