"use client";

import { useState } from "react";
import { Check, MessageSquare, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transitionApplicationAction } from "./application-actions";
import { updateInterviewAction } from "./interview-actions";
import { updateInvitationStatusAction } from "./invitation-actions";
import { updateStoryStatusAction } from "./story-actions";

export function ApplicationStatusActions({
  applicationUuid,
  requestUuid,
  currentStatus
}: {
  applicationUuid: string;
  requestUuid: string;
  currentStatus?: number | null;
}) {
  const [showNote, setShowNote] = useState(false);

  if (currentStatus === 2 || currentStatus === 4) return null;

  return (
    <div className="stageActions">
      <form action={transitionApplicationAction} className="inlineForm">
        <input name="application_uuid" type="hidden" value={applicationUuid} />
        <input name="request_uuid" type="hidden" value={requestUuid} />
        <input name="status" type="hidden" value={2} />
        {showNote ? <textarea name="note" placeholder="Shortlist note" className="compactTextarea" rows={2} /> : null}
        <Button type="submit" variant="outline" size="sm" onClick={() => setShowNote(false)}>
          <Check aria-hidden="true" />
          Shortlist
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowNote(!showNote)}
        >
          <MessageSquare aria-hidden="true" />
        </Button>
      </form>
      <form action={transitionApplicationAction} className="inlineForm">
        <input name="application_uuid" type="hidden" value={applicationUuid} />
        <input name="request_uuid" type="hidden" value={requestUuid} />
        <input name="status" type="hidden" value={3} />
        <Button type="submit" variant="ghost" size="sm">
          <ThumbsDown aria-hidden="true" />
          Reject
        </Button>
      </form>
    </div>
  );
}

export function InterviewStatusActions({
  interviewUuid,
  requestUuid,
  currentStatus
}: {
  interviewUuid: string;
  requestUuid: string;
  currentStatus?: number | null;
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="stageActions">
      {currentStatus !== 2 ? (
        <form action={updateInterviewAction} className="inlineForm">
          <input name="interview_uuid" type="hidden" value={interviewUuid} />
          <input name="request_uuid" type="hidden" value={requestUuid} />
          <input name="status" type="hidden" value={2} />
          {showNote ? <textarea name="interview_note" placeholder="Interview outcome" className="compactTextarea" rows={2} /> : null}
          <Button type="submit" variant="outline" size="sm" onClick={() => setShowNote(false)}>
            <Check aria-hidden="true" />
            Complete
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNote(!showNote)}
          >
            <MessageSquare aria-hidden="true" />
          </Button>
        </form>
      ) : null}
      {currentStatus !== 3 ? (
        <form action={updateInterviewAction} className="inlineForm">
          <input name="interview_uuid" type="hidden" value={interviewUuid} />
          <input name="request_uuid" type="hidden" value={requestUuid} />
          <input name="status" type="hidden" value={3} />
          <Button type="submit" variant="ghost" size="sm">
            <X aria-hidden="true" />
            Cancel
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function InvitationStatusActions({
  invitationUuid,
  requestUuid,
  currentStatus
}: {
  invitationUuid: string;
  requestUuid: string;
  currentStatus?: number | null;
}) {
  return (
    <div className="stageActions">
      {currentStatus !== 3 ? (
        <form action={updateInvitationStatusAction} className="inlineForm">
          <input name="invitation_uuid" type="hidden" value={invitationUuid} />
          <input name="request_uuid" type="hidden" value={requestUuid} />
          <input name="status" type="hidden" value={3} />
          <Button type="submit" variant="outline" size="sm">
            <Check aria-hidden="true" />
            Responded
          </Button>
        </form>
      ) : null}
      {currentStatus !== 5 ? (
        <form action={updateInvitationStatusAction} className="inlineForm">
          <input name="invitation_uuid" type="hidden" value={invitationUuid} />
          <input name="request_uuid" type="hidden" value={requestUuid} />
          <input name="status" type="hidden" value={5} />
          <Button type="submit" variant="ghost" size="sm">
            <X aria-hidden="true" />
            Declined
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function StoryStatusActions({
  storyUuid,
  requestUuid,
  currentStatus
}: {
  storyUuid: string;
  requestUuid: string;
  currentStatus?: number | null;
}) {
  return (
    <div className="stageActions">
      {currentStatus !== 2 ? (
        <form action={updateStoryStatusAction} className="inlineForm">
          <input name="story_uuid" type="hidden" value={storyUuid} />
          <input name="request_uuid" type="hidden" value={requestUuid} />
          <input name="status" type="hidden" value={2} />
          <Button type="submit" variant="outline" size="sm">
            <Check aria-hidden="true" />
            Complete
          </Button>
        </form>
      ) : null}
      {currentStatus !== 3 ? (
        <form action={updateStoryStatusAction} className="inlineForm">
          <input name="story_uuid" type="hidden" value={storyUuid} />
          <input name="request_uuid" type="hidden" value={requestUuid} />
          <input name="status" type="hidden" value={3} />
          <Button type="submit" variant="ghost" size="sm">
            <X aria-hidden="true" />
            Cancel
          </Button>
        </form>
      ) : null}
    </div>
  );
}
