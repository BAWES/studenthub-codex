"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/modules/auth/types";

export type WorkspaceOSState = {
  /** The session user, available from the layout. */
  session: SessionUser | null;
  /** Whether the shell is embedded inside another WorkspaceOS layout. */
  embedded?: boolean;
};

export const WorkspaceOSContext = createContext<WorkspaceOSState>({
  session: null
});

export function useWorkspaceOS() {
  return useContext(WorkspaceOSContext);
}
