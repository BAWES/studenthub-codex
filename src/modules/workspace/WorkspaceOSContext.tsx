"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/modules/auth/types";

export type WorkspaceOSState = {
  /** Whether the current render is inside a WorkspaceOS layout (sidebar provided externally). */
  embedded: boolean;
  /** The session user, available from the layout. */
  session: SessionUser | null;
};

export const WorkspaceOSContext = createContext<WorkspaceOSState>({
  embedded: false,
  session: null
});

export function useWorkspaceOS() {
  return useContext(WorkspaceOSContext);
}
