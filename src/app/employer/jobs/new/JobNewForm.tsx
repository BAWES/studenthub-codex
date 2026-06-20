"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createJob } from "../actions";

type Props = {
  employerId: number | null;
};

const inputClass =
  "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)] focus:shadow-[var(--sh-coral-glow)]";

const labelClass = "text-sm font-medium text-foreground";

const requiredStar = <span className="text-[var(--sh-coral)]">*</span>;

export function JobNewForm({ employerId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!employerId) {
      setError("No employer account linked to your session. Contact support.");
      setSubmitting(false);
      return;
    }

    const salaryRange = salaryMin || salaryMax
      ? `KWD ${salaryMin || "0"}${salaryMax ? ` — ${salaryMax}` : ""}`
      : undefined;

    try {
      const result = await createJob({
        employerId,
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        location: location.trim() || undefined,
        employmentType,
        salaryRange,
        status,
      });

      router.push(`/employer/jobs/${result.jobListingId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job posting");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-[var(--sh-coral)/20] bg-[var(--sh-coral)/8] p-4 text-sm text-[var(--sh-coral)]">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className={labelClass}>
          Job Title {requiredStar}
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
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className={labelClass}>
          Description {requiredStar}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="Describe the role, responsibilities, and day-to-day activities..."
          required
        />
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <label htmlFor="requirements" className={labelClass}>
          Requirements
        </label>
        <textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="Required skills, experience, certifications..."
        />
      </div>

      {/* Location & Employment Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            placeholder="Kuwait City"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="employmentType" className={labelClass}>
            Employment Type
          </label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className={inputClass}
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
        <label className={labelClass}>Salary Range (KWD/month)</label>
        <div className="grid grid-cols-2 gap-4">
          <input
            id="salaryMin"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className={inputClass}
            placeholder="Min"
            min={0}
          />
          <input
            id="salaryMax"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            className={inputClass}
            placeholder="Max"
            min={0}
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label htmlFor="status" className={labelClass}>
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputClass}
        >
          <option value="active">Active (visible to candidates)</option>
          <option value="draft">Draft (not visible)</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={submitting || !title.trim() || !description.trim()}>
          {submitting ? "Creating..." : "Create Job Posting"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/employer/jobs")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
