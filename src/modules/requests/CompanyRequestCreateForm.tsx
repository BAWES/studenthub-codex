"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCompanyRequest, type CompanyRequestFormState } from "./company-create-actions";

interface CompanyRequestCreateFormProps {
  companies: { id: number; name: string }[];
}

const initialState: CompanyRequestFormState = { success: false };

export function CompanyRequestCreateForm({ companies }: CompanyRequestCreateFormProps) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(createCompanyRequest, initialState);

  useEffect(() => {
    if (state.success && state.requestUuid) {
      router.push(`/company/requests/${state.requestUuid}`);
    }
  }, [state.success, state.requestUuid, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Hiring Request</CardTitle>
        <CardDescription>Fill in the required details for a new position.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch}>
          <label>
            Company
            <select name="company_id" required>
              <option value="">Select a company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {state.errors?.company_id && <p className="fieldError">{state.errors.company_id}</p>}

          <label>
            Job Title
            <Input name="position_title" placeholder="e.g. Sales Associate" required />
          </label>
          {state.errors?.position_title && <p className="fieldError">{state.errors.position_title}</p>}

          <label>
            Compensation Type
            <Input name="compensation" placeholder="e.g. 300 KWD / month" required />
          </label>
          {state.errors?.compensation && <p className="fieldError">{state.errors.compensation}</p>}

          <label>
            Store
            <Input name="store" placeholder="e.g. Avenues Mall Branch" required />
          </label>
          {state.errors?.store && <p className="fieldError">{state.errors.store}</p>}

          <label>
            Brand
            <Input name="brand" placeholder="e.g. Nike" required />
          </label>
          {state.errors?.brand && <p className="fieldError">{state.errors.brand}</p>}

          <label>
            Vacancy Count
            <Input name="number_of_employees" type="number" min={1} defaultValue={1} required />
          </label>
          {state.errors?.number_of_employees && <p className="fieldError">{state.errors.number_of_employees}</p>}

          {state.error && <p className="fieldError">{state.error}</p>}

          <Button type="submit" disabled={pending} className="primaryButton">
            {pending ? "Creating..." : "Create Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
