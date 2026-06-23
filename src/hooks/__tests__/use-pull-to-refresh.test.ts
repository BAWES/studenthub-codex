// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("usePullToRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with pullDistance=0 and isRefreshing=false", () => {
    const { result } = renderHook(() => usePullToRefresh({ onRefresh: vi.fn() }));

    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("sets isRefreshing=true when refresh is called", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

    let promise: Promise<void>;
    act(() => {
      promise = result.current.refresh();
    });

    expect(result.current.isRefreshing).toBe(true);
    await act(async () => {
      vi.advanceTimersByTimeAsync(800);
      await promise;
    });
    expect(result.current.isRefreshing).toBe(false);
  });

  it("resets isRefreshing after refresh completes", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

    await act(async () => {
      const p = result.current.refresh();
      vi.advanceTimersByTimeAsync(800);
      await p;
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it("respects minimum 800ms duration when refresh is fast", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

    let resolveTime: number;
    act(() => {
      const start = Date.now();
      result.current.refresh().then(() => {
        resolveTime = Date.now() - start;
      });
    });

    // Fast refresh completes immediately
    await act(async () => {
      vi.advanceTimersByTimeAsync(50); // Refresh resolves
      await Promise.resolve();
    });

    // But isRefreshing should still be true (800ms minimum)
    expect(result.current.isRefreshing).toBe(true);

    // Advance past 800ms
    await act(async () => {
      vi.advanceTimersByTimeAsync(800);
      await Promise.resolve();
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it("calls onRefresh when refresh is triggered", async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

    await act(async () => {
      const p = result.current.refresh();
      vi.advanceTimersByTimeAsync(800);
      await p;
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
