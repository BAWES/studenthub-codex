"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createRequestAction } from "./create-actions";

interface RequestCreateFormProps {
  companies: { id: number; name: string }[];
  redirectTo: string;
}

export function RequestCreateForm({ companies, redirectTo }: RequestCreateFormProps) {
  return (
    <Card className="requestCreateForm">
      <CardHeader>
        <CardTitle>Create New Request</CardTitle>
        <CardDescription>Fill in the position details and skills required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createRequestAction}>
          <input name="redirect_to" type="hidden" value={redirectTo} />

          <label>
            Company
            <select name="company_id" required>
              <option value="">Select a company...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Position Title
            <Input name="position_title" placeholder="e.g. Front-end Developer" required />
          </label>

          <label>
            Job Description
            <textarea name="job_description" rows={4} placeholder="Describe the role and responsibilities..." />
          </label>

          <label>
            Compensation
            <Input name="compensation" placeholder="e.g. 250 KWD / month" />
          </label>

          <label>
            Number of Employees
            <Input name="number_of_employees" type="number" min={1} defaultValue={1} required />
          </label>

          <label>
            Location
            <Input name="location" placeholder="e.g. Kuwait City" />
          </label>

          <label>
            Additional Info
            <textarea name="additional_info" rows={2} placeholder="Any extra notes..." />
          </label>

          <label>
            Skills (comma-separated)
            <Input name="skills" placeholder="e.g. React, TypeScript, Node.js" />
          </label>

          <label>
            Priority
            <select name="priority" defaultValue="0">
              <option value="0">Normal</option>
              <option value="1">High</option>
              <option value="2">Urgent</option>
            </select>
          </label>

          <Button type="submit" className="primaryButton">
            Create Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
