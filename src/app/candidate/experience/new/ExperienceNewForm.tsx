"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCandidateExperience } from "../actions";
import type { ExperienceActionResult } from "../actions";

export function ExperienceNewForm() {
  const router = useRouter();
  const [experience, setExperience] = useState("");
  const [employer, setEmployer] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result: ExperienceActionResult = await createCandidateExperience({
      experience,
      employer,
      startYear: startYear ? Number(startYear) : undefined,
      endYear: endYear ? Number(endYear) : undefined,
    });

    setSubmitting(false);

    if (result.success) {
      router.push(`/candidate/experience/${result.experienceId}`);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="experience">Position / Title *</Label>
        <Input
          id="experience"
          type="text"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          maxLength={128}
          required
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          {experience.length}/128 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employer">Employer</Label>
        <Input
          id="employer"
          type="text"
          value={employer}
          onChange={(e) => setEmployer(e.target.value)}
          placeholder="e.g. Acme Corp"
          maxLength={255}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startYear">Start Year</Label>
          <Input
            id="startYear"
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            placeholder="e.g. 2020"
            min={1900}
            max={2100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endYear">End Year</Label>
          <Input
            id="endYear"
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            placeholder="e.g. 2023"
            min={1900}
            max={2100}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || !experience.trim()}>
          {submitting ? "Adding..." : "Add Experience"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/candidate/experience")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
