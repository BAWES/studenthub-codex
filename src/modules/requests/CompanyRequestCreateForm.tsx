"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCompanyRequestAction, type CreateCompanyRequestState } from "./company-create-actions";

interface CompanyRequestCreateFormProps {
  companies: { id: number; name: string }[];
}

const initialState: CreateCompanyRequestState = {};

export function CompanyRequestCreateForm({ companies }: CompanyRequestCreateFormProps) {
  const [state, formAction, pending] = useActionState(createCompanyRequestAction, initialState);

  return (
    <Card className="requestCreateForm">
      <CardHeader>
        <CardTitle>New Hiring Request</CardTitle>
        <CardDescription>
          Submit a hiring request for your company. All fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          {state.error ? <p className="formError">{state.error}</p> : null}

          <label>
            Company *
            <select name="company_id" required defaultValue={state.values?.company_id ?? ""}>
              <option value="" disabled>
                Select a company...
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Job Title *
            <Input
              name="position_title"
              placeholder="e.g. Sales Associate"
              required
              defaultValue={state.values?.position_title ?? ""}
            />
          </label>

          <label>
            Compensation *
            <Input
              name="compensation"
              placeholder="e.g. 300 KWD / month"
              required
              defaultValue={state.values?.compensation ?? ""}
            />
          </label>

          <label>
            Store *
            <Input name="store" placeholder="e.g. The Avenues Mall" required defaultValue={state.values?.store ?? ""} />
          </label>

          <label>
            Brand *
            <Input name="brand" placeholder="e.g. Nike" required defaultValue={state.values?.brand ?? ""} />
          </label>

          <label>
            Vacancy Count *
            <Input
              name="vacancy_count"
              type="number"
              min={1}
              defaultValue={state.values?.vacancy_count ?? "1"}
              required
            />
          </label>

          <label>
            Job Description
            <textarea
              name="job_description"
              rows={4}
              placeholder="Describe the role and responsibilities..."
              defaultValue={state.values?.job_description ?? ""}
            />
          </label>

          <label>
            Location
            <Input name="location" placeholder="e.g. Kuwait City" defaultValue={state.values?.location ?? ""} />
          </label>

          <label>
            Skills (comma-separated)
            <Input
              name="skills"
              placeholder="e.g. Customer Service, POS Systems"
              defaultValue={state.values?.skills ?? ""}
            />
          </label>

          <Button type="submit" className="primaryButton" disabled={pending}>
            {pending ? "Creating..." : "Create Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
