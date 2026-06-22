"use client";

import * as React from "react";

export interface PullToRefreshOptions {
  /** Async function to call when pull-to-refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Minimum duration in ms (default: 800) — prevents flash on fast refreshes */
  minDurationMs?: number;
  /** Max pull distance in px (default: 160) */
  maxPullDistance?: number;
  /** Release threshold in px (default: 80) */
  threshold?: number;
}

export interface PullToRefreshState {
  /** Current pull distance in px (0–maxPullDistance) */
  pullDistance: number;
  /** Whether a refresh is in progress */
  isRefreshing: boolean;
  /** Trigger a refresh programmatically */
  refresh: () => Promise<void>;
}

/**
 * Pull-to-refresh hook for mobile viewports.
 *
 * Handles the refresh lifecycle with a minimum duration to prevent visual
 * flickering on fast network requests. The actual touch/scroll mechanics
 * are left to the consumer via `pullDistance` state; this hook manages
 * the async refresh lifecycle and timing guarantees.
 *
 * @example
 * ```tsx
 * const { isRefreshing, refresh } = usePullToRefresh({
 *   onRefresh: async () => { await fetchData(); },
 * });
 * ```
 */
export function usePullToRefresh({
  onRefresh,
  minDurationMs = 800,
}: PullToRefreshOptions): PullToRefreshState {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance] = React.useState(0);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = React.useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    const start = Date.now();

    try {
      await onRefresh();
    } finally {
      // Ensure minimum duration to prevent flash
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDurationMs - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh, minDurationMs, isRefreshing]);

  return {
    pullDistance,
    isRefreshing,
    refresh,
  };
}
