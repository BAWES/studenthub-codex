"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createJob } from "../actions";

const CORAL = "#eb6651";

type Props = {
  employerId: number | null;
};

function selectClasses() {
  return [
    "w-full min-h-[48px] rounded-lg border border-[var(--border)]",
    "bg-[var(--surface)] text-[var(--ink)] text-sm",
    "px-3 py-2.5 outline-none",
    "transition-all duration-200",
    "focus:border-[#eb6651] focus:shadow-[0_0_0_3px_rgba(235,102,81,0.15)]",
    "hover:bg-[var(--surface-soft)]",
  ].join(" ");
}

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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div
          className="rounded-lg border p-4 text-sm font-medium"
          style={{
            borderColor: "color-mix(in srgb, var(--destructive) 20%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--destructive) 10%, transparent)",
            color: "var(--destructive)",
          }}
        >
          {error}
        </div>
      )}

      {/* Title */}
      <div className="grid gap-2">
        <Label htmlFor="title">
          Job Title <span style={{ color: "var(--destructive)" }}>*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Software Engineer Intern"
          maxLength={255}
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">
          Description <span style={{ color: "var(--destructive)" }}>*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the role, responsibilities, and day-to-day activities..."
          required
          className="min-h-[120px]"
        />
      </div>

      {/* Requirements */}
      <div className="grid gap-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Required skills, experience, certifications..."
          className="min-h-[80px]"
        />
      </div>

      {/* Location & Employment Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kuwait City"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className={selectClasses()}
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
      <div className="grid gap-2">
        <Label>Salary Range (KWD/month)</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="salaryMin"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Min"
            min={0}
          />
          <Input
            id="salaryMax"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="Max"
            min={0}
          />
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClasses()}
        >
          <option value="active">Active (visible to candidates)</option>
          <option value="draft">Draft (not visible)</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={submitting || !title.trim() || !description.trim()}
          style={{
            backgroundColor: CORAL,
            color: "white",
            border: "none",
            minHeight: 48,
            paddingLeft: 28,
            paddingRight: 28,
          }}
        >
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
