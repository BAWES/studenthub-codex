"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status badge header */}
      <div className="flex items-center gap-3">
        <StatusBadge variant={genericStatusVariant(status)} label={status} size="md" />
        <span className="text-xs text-muted-foreground">Posted: {new Date(job.createdAt).toLocaleDateString("en-KW")}</span>
        <span className="text-xs text-muted-foreground">Updated: {new Date(job.updatedAt).toLocaleDateString("en-KW")}</span>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Job Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineer Intern"
          maxLength={255}
          required
          readOnly={readOnly}
          autoFocus={!readOnly}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the role..."
          className="min-h-[120px]"
          required
          readOnly={readOnly}
        />
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Required skills, experience..."
          className="min-h-[80px]"
          readOnly={readOnly}
        />
      </div>

      {/* Location & Employment Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kuwait City"
            readOnly={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select value={employmentType} onValueChange={setEmploymentType} disabled={readOnly}>
            <SelectTrigger id="employmentType" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary Range (KWD) */}
      <div className="space-y-2">
        <Label>Salary Range (KWD/month)</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="salaryMin"
            type="number"
            value={salaryMinVal}
            onChange={(e) => setSalaryMinVal(e.target.value)}
            placeholder="Min"
            min={0}
            readOnly={readOnly}
          />
          <Input
            id="salaryMax"
            type="number"
            value={salaryMaxVal}
            onChange={(e) => setSalaryMaxVal(e.target.value)}
            placeholder="Max"
            min={0}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus} disabled={readOnly}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active (visible to candidates)</SelectItem>
            <SelectItem value="draft">Draft (not visible)</SelectItem>
            <SelectItem value="closed">Closed (no longer accepting)</SelectItem>
            <SelectItem value="filled">Filled (position filled)</SelectItem>
          </SelectContent>
        </Select>
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
