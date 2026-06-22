"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ActionButton } from "@/modules/workspace/ActionButton";
import { deleteCandidateCertification } from "../actions";

type DeleteCertificationButtonProps = {
  certificationId: number;
};

export function DeleteCertificationButton({ certificationId }: DeleteCertificationButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this certification?")) return;

    const result = await deleteCandidateCertification(certificationId);
    if (result.success) {
      router.push("/candidate/certifications");
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
