"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="experience" className="text-sm font-medium">
          Position / Title *
        </label>
        <input
          id="experience"
          type="text"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          placeholder="e.g. Senior Software Engineer"
          maxLength={128}
          required
          autoFocus
        />
        <p className="text-xs text-white/40">
          {experience.length}/128 characters
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="employer" className="text-sm font-medium">
          Employer
        </label>
        <input
          id="employer"
          type="text"
          value={employer}
          onChange={(e) => setEmployer(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          placeholder="e.g. Acme Corp"
          maxLength={255}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startYear" className="text-sm font-medium">
            Start Year
          </label>
          <input
            id="startYear"
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            placeholder="e.g. 2020"
            min={1900}
            max={2100}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endYear" className="text-sm font-medium">
            End Year
          </label>
          <input
            id="endYear"
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
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
