import type { Route } from "next";
import Link from "next/link";
import { Mail, Plus, Search, UserRoundCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SuggestForm, InviteForm } from "@/modules/requests/MatchActions";
import { createStoryAction } from "@/modules/requests/story-actions";
import {
  ApplicationStatusActions,
  InterviewStatusActions,
  InvitationStatusActions,
  StoryStatusActions
} from "@/modules/requests/StageActions";
import type { getRequestDetail } from "@/modules/workspace/data";

type RequestDetailData = Awaited<ReturnType<typeof getRequestDetail>>;

type ActionableRow = {
  id: string | number;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
  status?: number | null;
};

export function RequestFulfillmentOS({
  data,
  role,
  basePath,
  notice: _notice
}: {
  data: RequestDetailData;
  role: "admin" | "staff";
  basePath: "/admin/requests" | "/staff/requests";
  notice?: string;
}) {
  if (!data.request) return null;
  const request = data.request;
  const requestUuid = request.request_uuid;

  return (
    <section className="requestOS">
      <section className="requestHero">
        <div>
          <span>Request fulfillment</span>
          <h2>{request.request_position_title ?? "Untitled request"}</h2>
          <p>{data.requestSummary}</p>
          <div className="requestHeroMeta">
            {data.requestSkills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {!data.requestSkills.length ? <Badge variant="outline">No skills mapped</Badge> : null}
          </div>
        </div>
        <aside>
          <span>{request.company?.company_name ?? "No company"}</span>
          <strong>{request.request_status ?? "No status"}</strong>
          <small>{request.request_number_of_employees ?? 0} requested seats</small>
        </aside>
      </section>

      <section className="requestActionBar" aria-label="Request actions">
        <Button asChild variant="secondary">
          <Link href={`${basePath}/${requestUuid}#matches` as Route}>
            <Search aria-hidden="true" />
            Find candidates
          </Link>
        </Button>
        {data.suggestionEmailHref ? (
          <Button asChild variant="outline">
            <a href={data.suggestionEmailHref}>
              <Mail aria-hidden="true" />
              Draft employer email
            </a>
          </Button>
        ) : null}
        <Button asChild variant="ghost">
          <Link href={`${basePath}/${requestUuid}#suggestions` as Route}>
            <UserRoundCheck aria-hidden="true" />
            Review suggestions
          </Link>
        </Button>
      </section>

      <section className="requestPipeline" aria-label="Request pipeline">
        {data.pipeline.map((stage) => (
          <a href={`#${stage.id}`} key={stage.id}>
            <span>{stage.label}</span>
            <strong>{stage.value}</strong>
            <small>{stage.note}</small>
          </a>
        ))}
      </section>

      <section className="requestDeskGrid">
        {/* Matches card */}
        <Card className="requestPanel" id="matches">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Candidate matching</span>
              <CardTitle>Search-led shortlist</CardTitle>
            </div>
            <CardDescription>{data.matchedCandidates.length} shown</CardDescription>
          </CardHeader>
          <CardContent className="matchList">
            {data.matchedCandidates.map((candidate) => (
              <Card className="matchCard" key={candidate.id}>
                <div>
                  <span>{candidate.signal}</span>
                  <strong>{candidate.name}</strong>
                  <small>{candidate.email}</small>
                </div>
                <div className="matchReasons">
                  {candidate.reasons.map((reason) => (
                    <Badge key={reason} variant="outline">
                      {reason}
                    </Badge>
                  ))}
                </div>
                <div className="matchMeta">
                  <Badge variant="secondary">{candidate.country}</Badge>
                  <Badge variant="secondary">{candidate.university}</Badge>
                  <Badge variant="success">{candidate.rate}</Badge>
                </div>
                <div className="matchActionsRow">
                  <SuggestForm requestUuid={requestUuid} candidateId={candidate.id} />
                  <InviteForm requestUuid={requestUuid} candidateId={candidate.id} />
                </div>
                <Button asChild variant="ghost" size="sm">
                  {role === "admin" ? (
                    <Link href={`/admin/candidates/${candidate.id}` as Route}>Open full profile</Link>
                  ) : (
                    <Link href={`/staff/candidates?candidate=${candidate.id}` as Route}>Preview in candidate search</Link>
                  )}
                </Button>
              </Card>
            ))}
            {!data.matchedCandidates.length ? (
              <div className="requestEmpty">
                <strong>No match candidates found.</strong>
                <span>Add request skills or search from the candidate workspace.</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Suggestions card */}
        <Card className="requestPanel" id="suggestions">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Employer-ready</span>
              <CardTitle>Suggestions</CardTitle>
            </div>
            <CardDescription>{data.suggestions.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows rows={data.suggestions} />
          </CardContent>
        </Card>

        {/* Invitations card */}
        <Card className="requestPanel" id="invited">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Candidate outreach</span>
              <CardTitle>Invitations</CardTitle>
            </div>
            <CardDescription>{data.invitations.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows
              rows={data.invitations}
              actions={(row) => (
                <InvitationStatusActions
                  invitationUuid={String(row.id)}
                  requestUuid={requestUuid}
                  currentStatus={row.status}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Applications card */}
        <Card className="requestPanel">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Inbound</span>
              <CardTitle>Applications</CardTitle>
            </div>
            <CardDescription>{data.applications.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows
              rows={data.applications}
              actions={(row) => (
                <ApplicationStatusActions
                  applicationUuid={String(row.id)}
                  requestUuid={requestUuid}
                  currentStatus={row.status}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Interviews card */}
        <Card className="requestPanel">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Evaluation</span>
              <CardTitle>Interviews</CardTitle>
            </div>
            <CardDescription>{data.interviews.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows
              rows={data.interviews}
              actions={(row) => (
                <InterviewStatusActions
                  interviewUuid={String(row.id)}
                  requestUuid={requestUuid}
                  currentStatus={row.status}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Stories card */}
        <Card className="requestPanel">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Work trail</span>
              <CardTitle>Stories and updates</CardTitle>
            </div>
            <CardDescription>{data.activities.length + data.stories.length} rows</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createStoryAction} className="storyForm">
              <input name="request_uuid" type="hidden" value={requestUuid} />
              <Input name="note" placeholder="What happened on this request?" />
              <Button type="submit" variant="secondary" size="sm">
                <Plus aria-hidden="true" />
                Log update
              </Button>
            </form>
            <RequestRows
              rows={[...data.stories, ...data.activities].slice(0, 12)}
              actions={(row) =>
                row.status !== undefined ? (
                  <StoryStatusActions
                    storyUuid={String(row.id)}
                    requestUuid={requestUuid}
                    currentStatus={row.status}
                  />
                ) : null
              }
            />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}

function RequestRows({
  rows,
  actions
}: {
  rows: ActionableRow[];
  actions?: (row: ActionableRow) => React.ReactNode;
}) {
  return (
    <div className="requestRows">
      {rows.length ? (
        rows.map((row) => (
          <div key={row.id} className="requestRow">
            {row.href ? (
              <Link href={row.href as Route} className="requestRowLink">
                <strong>{row.title}</strong>
                <span>{row.subtitle}</span>
                {row.meta ? <small>{row.meta}</small> : null}
              </Link>
            ) : (
              <div className="requestRowLink">
                <strong>{row.title}</strong>
                <span>{row.subtitle}</span>
                {row.meta ? <small>{row.meta}</small> : null}
              </div>
            )}
            {actions ? <div className="requestRowActions">{actions(row)}</div> : null}
          </div>
        ))
      ) : (
        <div className="requestEmpty">
          <strong>No imported rows here yet.</strong>
          <span>This stage is empty for the selected production request.</span>
        </div>
      )}
    </div>
  );
}
