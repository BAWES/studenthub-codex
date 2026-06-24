"use client";

import { useActionState } from "react";
import { removeCompanyStore } from "@/modules/company/actions";
import { Button } from "@/components/ui/button";

export function RemoveStoreButton({ storeId, storeName }: { storeId: number; storeName: string }) {
  const [, action, pending] = useActionState(removeCompanyStore, { error: "" });

  return (
    <form action={action} className="inline">
      <input type="hidden" name="storeId" value={storeId} />
      <Button
        type="submit"
        variant="link"
        size="sm"
        className="text-destructive hover:text-destructive/80 p-0 h-auto font-medium"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(`Remove store "${storeName}"?`)) e.preventDefault();
        }}
      >
        {pending ? "Removing..." : "Remove"}
      </Button>
    </form>
  );
}
