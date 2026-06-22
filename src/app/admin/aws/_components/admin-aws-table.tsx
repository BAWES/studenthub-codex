"use client";

import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { AwsConfigEntry, AwsConfigResult } from "../schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  session: SessionUser;
  entries: AwsConfigEntry[];
  awsResult: AwsConfigResult;
};

export function AdminAwsTable({ session, entries, awsResult }: Props) {
  const hasEntries = entries.length > 0;

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="AWS S3 configuration — view current S3 bucket and access key settings."
      metrics={[
        {
          label: "Configuration keys",
          value: entries.length,
          note: "AWS config items defined",
        },
      ]}
    >
      {/* Summary card */}
      <section className="mb-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Connection summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Region
                </span>
                <p className="text-sm mt-1 font-mono text-foreground">
                  {awsResult.region || <span className="text-muted-foreground">Not configured</span>}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  S3 Bucket
                </span>
                <p className="text-sm mt-1 font-mono text-foreground">
                  {awsResult.bucket || <span className="text-muted-foreground">Not configured</span>}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Access Key
                </span>
                <p className="text-sm mt-1 font-mono text-foreground">
                  {awsResult.key
                    ? `••••••••${awsResult.key.slice(-4)}`
                    : <span className="text-muted-foreground">Not configured</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Config entries table */}
      {hasEntries ? (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Config key</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.key}>
                  <TableCell className="font-mono text-xs">{entry.key}</TableCell>
                  <TableCell className={`font-mono text-xs ${entry.value ? "text-foreground" : "text-muted-foreground"}`}>
                    {entry.value || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No AWS config keys found. Configure them in the server environment.
          </p>
        </div>
      )}
    </WorkspaceShell>
  );
}
