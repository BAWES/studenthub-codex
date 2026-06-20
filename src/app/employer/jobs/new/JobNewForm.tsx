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
        <div className="rounded-lg border border-[var(--sh-coral-light)] bg-[#fef1ef] p-4 text-sm text-[#d45441]">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Job Title <span style={{ color: "var(--sh-coral)" }}>*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150"
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
            color: "var(--ink)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--sh-coral)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          placeholder="e.g. Software Engineer Intern"
          maxLength={255}
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Description <span style={{ color: "var(--sh-coral)" }}>*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 min-h-[120px]"
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
            color: "var(--ink)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--sh-coral)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          placeholder="Describe the role, responsibilities, and day-to-day activities..."
          required
        />
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <label htmlFor="requirements" className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          Requirements
        </label>
        <textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 min-h-[80px]"
          style={{
            borderColor: "var(--border)",
            background: "var(--card)",
            color: "var(--ink)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--sh-coral)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
          placeholder="Required skills, experience, certifications..."
        />
      </div>

      {/* Location & Employment Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--ink)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--sh-coral)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
            placeholder="Kuwait City"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="employmentType" className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            Employment Type
          </label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
              color: "var(--ink)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--sh-coral)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
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
        <label className="text-sm font-medium" style={{ color: "var(--ink)" }}>Salary Range (KWD/month)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              id="salaryMin"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--ink)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--sh-coral)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
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
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
                color: "var(--ink)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--sh-coral)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
              placeholder="Max"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
      <label htmlFor="status" className="text-sm font-medium" style={{ color: "var(--ink)" }}>
        Status
      </label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150"
        style={{
          borderColor: "var(--border)",
          background: "var(--card)",
          color: "var(--ink)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--sh-coral)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(235, 102, 81, 0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
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
