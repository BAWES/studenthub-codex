"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionButton } from "@/modules/workspace/ActionButton";
import { deleteReferenceEntry } from "./actions";

type DeleteReferenceButtonProps = {
  referenceUuid: string;
};

export function DeleteReferenceButton({ referenceUuid }: DeleteReferenceButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this reference?")) return;

    const result = await deleteReferenceEntry(referenceUuid);
    if (result.success) {
      router.push("/candidate/references");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <ActionButton variant="danger" icon={<Trash2 className="size-4" />} onClick={handleDelete}>
      Delete
    </ActionButton>
  );
}
