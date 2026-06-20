// ---------------------------------------------------------------------------
// Employer Application Detail — Server Actions (page-level re-exports)
// ---------------------------------------------------------------------------
// All business logic lives in src/modules/employer/applications/actions.ts
// (which has "use server"). This barrel re-exports so page consumers keep
// their current import paths without duplicating the "use server" directive.
// ---------------------------------------------------------------------------

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateApplicationStatus as updateStatus } from "@/modules/employer/applications/actions";

export {
  getApplicationDetail,
} from "@/modules/employer/applications/actions";

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
  await updateStatus({ applicationId, status: "rejected" });
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
