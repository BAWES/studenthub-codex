"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import type { FulltimerListItem } from "@/modules/fulltimers/schemas";

type Props = {
  fulltimer: FulltimerListItem;
};

export function FulltimerDetailView({ fulltimer }: Props) {
  const router = useRouter();

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fulltimer Candidate</CardTitle>
          <CardDescription>
            {fulltimer.fulltimer_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name" value={fulltimer.fulltimer_name} />
            <Field label="Email" value={fulltimer.fulltimer_email} />
            <Field label="Phone" value={fulltimer.fulltimer_phone} />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Employed</Label>
              <div>
                {fulltimer.fulltimer_employed === true ? (
                  <Badge variant="success">Yes</Badge>
                ) : fulltimer.fulltimer_employed === false ? (
                  <Badge variant="secondary">No</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>
            <Field label="Nationality" value={fulltimer.nationality_name} />
            <Field label="Country" value={fulltimer.country_name} />
            <Field label="University" value={fulltimer.university_name} />
            <Field label="Current Salary" value={fulltimer.fulltimer_current_salary} />
            <Field label="Expected Salary" value={fulltimer.fulltimer_expected_salary} />
            <Field
              label="Created"
              value={
                fulltimer.fulltimer_created_datetime
                  ? new Date(fulltimer.fulltimer_created_datetime).toLocaleString()
                  : null
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/fulltimer")}>
          Back to list
        </Button>
      </div>
    </div>
  );
}
