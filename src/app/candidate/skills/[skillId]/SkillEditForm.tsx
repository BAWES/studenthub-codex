"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateCandidateSkill } from "../actions";
import type { SkillActionResult } from "../actions";

type SkillEditFormProps = {
  skillId: number;
  currentName: string;
};

export function SkillEditForm({ skillId, currentName }: SkillEditFormProps) {
  const router = useRouter();
  const [skill, setSkill] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result: SkillActionResult = await updateCandidateSkill({
      skillId,
      skill,
    });

    setSubmitting(false);

    if (result.success) {
      router.push(`/candidate/skills/${result.skillId}`);
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
        <label htmlFor="skill" className="text-sm font-medium">
          Skill Name
        </label>
        <input
          id="skill"
          type="text"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          placeholder="e.g. JavaScript, Project Management"
          maxLength={128}
          required
        />
        <p className="text-xs text-white/40">
          {skill.length}/128 characters
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || !skill.trim()}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/candidate/skills/${skillId}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
