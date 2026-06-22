"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionButton } from "@/modules/workspace/ActionButton";
import { deleteExperienceEntry } from "./actions";

type DeleteExperienceButtonProps = {
  experienceId: number;
};

export function DeleteExperienceButton({ experienceId }: DeleteExperienceButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this experience entry?")) return;

    const result = await deleteExperienceEntry(experienceId);
    if (result.success) {
      router.push("/candidate/experience");
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
