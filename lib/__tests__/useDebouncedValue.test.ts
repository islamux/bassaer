import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("only publishes the latest value after the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 150), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("b");
  });

  it("keeps the previous value while the user is still typing", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 150), {
      initialProps: { value: "" },
    });

    rerender({ value: "ب" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "بص" });

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("بص");
  });
});
