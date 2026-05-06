import type { Route } from "next";
import Link from "next/link";
import { Mail, Search, Send, UserRoundCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addCandidateSuggestionAction } from "./actions";
import type { getRequestDetail } from "@/modules/workspace/data";

type RequestDetailData = Awaited<ReturnType<typeof getRequestDetail>>;

const noticeCopy: Record<string, { title: string; body: string }> = {
  "suggestion-added": {
    title: "Suggestion added",
    body: "The candidate is now in the request suggestion pipeline in the local production clone."
  },
  "duplicate-suggestion": {
    title: "Already suggested",
    body: "This candidate already has an active suggestion for this request."
  },
  "missing-suggestion": {
    title: "Missing suggestion reason",
    body: "Add a short reason before creating a suggestion."
  },
  "not-found": {
    title: "Suggestion blocked",
    body: "The request or candidate was not available to this login."
  }
};

export function RequestFulfillmentOS({
  data,
  role,
  basePath,
  notice
}: {
  data: RequestDetailData;
  role: "admin" | "staff";
  basePath: "/admin/requests" | "/staff/requests";
  notice?: string;
}) {
  if (!data.request) return null;
  const request = data.request;
  const activeNotice = notice ? noticeCopy[notice] : null;

  return (
    <section className="requestOS">
      {activeNotice ? (
        <div className="requestNotice">
          <strong>{activeNotice.title}</strong>
          <span>{activeNotice.body}</span>
        </div>
      ) : null}

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
          <Link href={`${basePath}/${request.request_uuid}#matches` as Route}>
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
          <Link href={`${basePath}/${request.request_uuid}#suggestions` as Route}>
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
                <form className="suggestionForm" action={addCandidateSuggestionAction}>
                  <input name="request_uuid" type="hidden" value={request.request_uuid} />
                  <input name="candidate_id" type="hidden" value={candidate.id} />
                  <Input name="reason" placeholder="Why this candidate fits" />
                  <Button type="submit">
                    <Send aria-hidden="true" />
                    Suggest
                  </Button>
                </form>
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

        <Card className="requestPanel" id="invited">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Candidate outreach</span>
              <CardTitle>Invitations</CardTitle>
            </div>
            <CardDescription>{data.invitations.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows rows={data.invitations} />
          </CardContent>
        </Card>

        <Card className="requestPanel">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Inbound</span>
              <CardTitle>Applications</CardTitle>
            </div>
            <CardDescription>{data.applications.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows rows={data.applications} />
          </CardContent>
        </Card>

        <Card className="requestPanel">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Evaluation</span>
              <CardTitle>Interviews</CardTitle>
            </div>
            <CardDescription>{data.interviews.length} shown</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows rows={data.interviews} />
          </CardContent>
        </Card>

        <Card className="requestPanel">
          <CardHeader className="requestPanelHeader">
            <div>
              <span>Work trail</span>
              <CardTitle>Stories and updates</CardTitle>
            </div>
            <CardDescription>{data.activities.length + data.stories.length} rows</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestRows rows={[...data.stories, ...data.activities].slice(0, 12)} />
          </CardContent>
        </Card>
      </section>
    </section>
  );
}

function RequestRows({
  rows
}: {
  rows: { id: string | number; title: string; subtitle: string; meta?: string; href?: string }[];
}) {
  return (
    <div className="requestRows">
      {rows.length ? (
        rows.map((row) =>
          row.href ? (
            <Link href={row.href as Route} key={row.id}>
              <strong>{row.title}</strong>
              <span>{row.subtitle}</span>
              {row.meta ? <small>{row.meta}</small> : null}
            </Link>
          ) : (
            <article key={row.id}>
              <strong>{row.title}</strong>
              <span>{row.subtitle}</span>
              {row.meta ? <small>{row.meta}</small> : null}
            </article>
          )
        )
      ) : (
        <div className="requestEmpty">
          <strong>No imported rows here yet.</strong>
          <span>This stage is empty for the selected production request.</span>
        </div>
      )}
    </div>
  );
}
