"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { scheduleInterviewAction } from "@/modules/requests/interview-actions";

interface MatchCandidate {
  id: number;
  name: string;
}

interface ScheduleInterviewFormProps {
  requestUuid: string;
  matchedCandidates: MatchCandidate[];
}

export function ScheduleInterviewForm({
  requestUuid,
  matchedCandidates,
}: ScheduleInterviewFormProps) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
      >
        <CalendarPlus aria-hidden="true" />
        Schedule interview
      </Button>
    );
  }

  return (
    <form action={scheduleInterviewAction} className="scheduleInterviewForm">
      <input name="request_uuid" type="hidden" value={requestUuid} />

      <div className="scheduleInterviewField">
        <label htmlFor="interview_candidate">Candidate</label>
        {matchedCandidates.length > 0 ? (
          <select
            id="interview_candidate"
            name="candidate_id"
            className="scheduleInterviewSelect"
            required
          >
            <option value="">Select candidate…</option>
            {matchedCandidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <Input
            name="candidate_id"
            type="number"
            placeholder="Candidate ID"
            required
            min={1}
          />
        )}
      </div>

      <div className="scheduleInterviewField">
        <label htmlFor="interview_at">Date & time</label>
        <Input
          id="interview_at"
          name="interview_at"
          type="datetime-local"
          required
        />
      </div>

      <div className="scheduleInterviewField">
        <label htmlFor="internal_note">Note (optional)</label>
        <textarea
          id="internal_note"
          name="internal_note"
          className="scheduleInterviewTextarea"
          placeholder="Any details about this interview…"
          rows={2}
        />
      </div>

      <div className="scheduleInterviewActions">
        <Button type="submit" variant="default" size="sm">
          Schedule
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
