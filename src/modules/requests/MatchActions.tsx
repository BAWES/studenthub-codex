"use client";

import { Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCandidateSuggestionAction } from "@/modules/requests/actions";
import { createInvitationAction } from "@/modules/requests/invitation-actions";

export function SuggestForm({
  requestUuid,
  candidateId,
  placeholder
}: {
  requestUuid: string;
  candidateId: number;
  placeholder?: string;
}) {
  return (
    <form className="suggestionForm" action={addCandidateSuggestionAction}>
      <input name="request_uuid" type="hidden" value={requestUuid} />
      <input name="candidate_id" type="hidden" value={candidateId} />
      <Input name="reason" placeholder={placeholder ?? "Why this candidate fits"} />
      <Button type="submit">
        <Send aria-hidden="true" />
        Suggest
      </Button>
    </form>
  );
}

export function InviteForm({
  requestUuid,
  candidateId,
  suggestionUuid
}: {
  requestUuid: string;
  candidateId: number;
  suggestionUuid?: string;
}) {
  return (
    <form action={createInvitationAction}>
      <input name="request_uuid" type="hidden" value={requestUuid} />
      <input name="candidate_id" type="hidden" value={candidateId} />
      {suggestionUuid ? <input name="suggestion_uuid" type="hidden" value={suggestionUuid} /> : null}
      <Button type="submit" variant="outline" size="sm">
        <UserPlus aria-hidden="true" />
        Invite
      </Button>
    </form>
  );
}
