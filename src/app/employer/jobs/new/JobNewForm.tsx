"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          autoFocus
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
          placeholder="Describe the role, responsibilities, and day-to-day activities..."
          className="min-h-[120px]"
          required
        />
      </div>

      {/* Requirements */}
      <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Kuwait City"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentType">Employment Type</Label>
          <Select value={employmentType} onValueChange={setEmploymentType}>
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
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active (visible to candidates)</SelectItem>
            <SelectItem value="draft">Draft (not visible)</SelectItem>
          </SelectContent>
        </Select>
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
