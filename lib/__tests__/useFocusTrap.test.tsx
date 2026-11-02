import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFocusTrap } from "@/lib/useFocusTrap";

function createFixture() {
  const outside = document.createElement("button");
  outside.textContent = "outside";
  const container = document.createElement("div");
  const first = document.createElement("button");
  first.textContent = "first";
  const middle = document.createElement("input");
  const last = document.createElement("button");
  last.textContent = "last";
  container.append(first, middle, last);
  document.body.append(outside, container);
  outside.focus();
  return { outside, container, first, middle, last };
}

describe("useFocusTrap", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses the first focusable element on activation", () => {
    const { container, first } = createFixture();
    const ref = { current: container };

    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: false },
    });
    rerender({ active: true });

    expect(document.activeElement).toBe(first);
  });

  it("wraps Tab from the last element to the first and Shift+Tab back", () => {
    const { container, first, last } = createFixture();
    const ref = { current: container };

    renderHook(() => useFocusTrap(ref, true));

    last.focus();
    last.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);

    first.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })
    );
    expect(document.activeElement).toBe(last);
  });

  it("restores focus when deactivated", () => {
    const { container, outside } = createFixture();
    const ref = { current: container };

    const { rerender } = renderHook(({ active }) => useFocusTrap(ref, active), {
      initialProps: { active: true },
    });

    expect(document.activeElement).not.toBe(outside);

    rerender({ active: false });
    expect(document.activeElement).toBe(outside);
  });
});
