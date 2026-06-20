"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionButton } from "@/modules/workspace/ActionButton";
import { deleteCandidateSkill } from "../actions";

type DeleteSkillButtonProps = {
  skillId: number;
};

export function DeleteSkillButton({ skillId }: DeleteSkillButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    const result = await deleteCandidateSkill({ skillId });
    if (result.success) {
      router.push("/candidate/skills");
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
