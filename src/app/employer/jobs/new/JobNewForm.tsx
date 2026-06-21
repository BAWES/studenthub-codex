"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createJob } from "../actions";

type Props = {
  employerId: number | null;
};

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
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

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
          className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30"
          placeholder="e.g. Software Engineer Intern"
          maxLength={255}
          required
          autoFocus
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
          className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30 min-h-[120px]"
          placeholder="Describe the role, responsibilities, and day-to-day activities..."
          required
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
          className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30 min-h-[80px]"
          placeholder="Required skills, experience, certifications..."
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
            className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30"
            placeholder="Kuwait City"
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
            className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30"
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
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30"
              placeholder="Min"
              min={0}
            />
          </div>
          <div>
            <input
              id="salaryMax"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30"
              placeholder="Max"
              min={0}
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
          className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:border-[var(--sh-coral)] focus:ring-1 focus:ring-[var(--sh-coral)]/30"
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
