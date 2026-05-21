"use client";

import { exportCandidateBundle } from "./export-actions";

export function ExportCVsForm({ candidateIds }: { candidateIds: string }) {
  return (
    <form action={exportCandidateBundle as unknown as (formData: FormData) => void}>
      <input name="candidateIds" type="hidden" value={candidateIds} />
      <button type="submit">Export CVs</button>
    </form>
  );
}
