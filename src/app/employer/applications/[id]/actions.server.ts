"use server";

import { revalidatePath } from "next/cache";
import { updateApplicationStatus as updateStatus } from "@/modules/employer/applications/actions";

/**
 * Accept an application — form action wrapper.
 * Updates the status and revalidates the detail page.
 */
export async function acceptApplication(formData: FormData): Promise<void> {
  const applicationId = Number(formData.get("applicationId"));
  await updateStatus({ applicationId, status: "accepted" });
  revalidatePath(`/employer/applications/${applicationId}`);
}

/**
 * Reject an application — form action wrapper.
 * Updates the status and revalidates the detail page.
 */
export async function rejectApplication(formData: FormData): Promise<void> {
  const applicationId = Number(formData.get("applicationId"));
  const rejectionReason = (formData.get("rejectionReason") as string) || undefined;
  await updateStatus({ applicationId, status: "rejected", rejectionReason });
  revalidatePath(`/employer/applications/${applicationId}`);
}

/**
 * Move an application back to reviewing status — form action wrapper.
 */
export async function revertApplicationStatus(formData: FormData): Promise<void> {
  const applicationId = Number(formData.get("applicationId"));
  await updateStatus({ applicationId, status: "reviewing" });
  revalidatePath(`/employer/applications/${applicationId}`);
}
