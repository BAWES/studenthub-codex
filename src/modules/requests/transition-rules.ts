// ---------------------------------------------------------------------------
// Request status transition rules (pure logic)
//
// Maps the valid state machine transitions from the legacy Yii2
// RequestController. This file has NO "use server" directive — the
// functions are pure logic exports usable in tests and on both
// client and server without Next.js restrictions.
// ---------------------------------------------------------------------------

export type RequestStatus =
  | "pending"
  | "started"
  | "delivered"
  | "cancelled"
  | "finished_by_recruitment"
  | "re_work";

const ALL_STATUSES: RequestStatus[] = [
  "pending",
  "started",
  "delivered",
  "cancelled",
  "finished_by_recruitment",
  "re_work",
];

/**
 * Valid transition map: key = current status, value = array of valid targets.
 * Terminal statuses (cancelled, finished_by_recruitment) have an empty array.
 */
export const TRANSITION_RULES: Record<RequestStatus, RequestStatus[]> = {
  pending: ["started", "cancelled", "finished_by_recruitment"],
  started: ["delivered", "cancelled", "pending"],
  delivered: ["re_work"],
  cancelled: [],
  finished_by_recruitment: [],
  re_work: ["started", "delivered"],
};

/**
 * Get the list of valid target statuses from a given source status.
 * Returns null if the source status is unknown.
 */
export function getValidTransitions(
  fromStatus: string,
): RequestStatus[] | null {
  return TRANSITION_RULES[fromStatus as RequestStatus] ?? null;
}

/**
 * Check whether a transition from `fromStatus` to `toStatus` is valid.
 */
export function isValidTransition(
  fromStatus: string,
  toStatus: string,
): boolean {
  const validTargets = getValidTransitions(fromStatus);
  if (!validTargets) return false;
  return validTargets.includes(toStatus as RequestStatus);
}

/**
 * Return a human-readable error message for an invalid transition,
 * or null if the transition is valid.
 */
export function transitionError(
  fromStatus: string,
  toStatus: string,
): string | null {
  const validTargets = getValidTransitions(fromStatus);
  if (validTargets === null) {
    return `Unknown source status: "${fromStatus}"`;
  }
  if (validTargets.includes(toStatus as RequestStatus)) {
    return null; // valid
  }
  if (validTargets.length === 0) {
    return `Cannot transition from "${fromStatus}" to "${toStatus}". Valid targets: (terminal — no transitions allowed)`;
  }
  return `Cannot transition from "${fromStatus}" to "${toStatus}". Valid targets: ${validTargets.join(", ")}`;
}
