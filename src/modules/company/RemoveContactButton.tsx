"use client";

import { useActionState } from "react";
import { removeCompanyContact } from "@/modules/company/actions";
import { Button } from "@/components/ui/button";

export function RemoveContactButton({ companyContactUuid, contactName }: { companyContactUuid: string; contactName: string }) {
  const [, action, pending] = useActionState(removeCompanyContact, { error: "" });

  return (
    <form action={action} className="inline">
      <input type="hidden" name="companyContactUuid" value={companyContactUuid} />
      <Button
        type="submit"
        variant="link"
        size="sm"
        className="text-destructive hover:text-destructive/80 p-0 h-auto font-medium"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(`Remove ${contactName} from this company?`)) e.preventDefault();
        }}
      >
        {pending ? "Removing..." : "Remove"}
      </Button>
    </form>
  );
}
