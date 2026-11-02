import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import SearchDialog from "@/components/SearchDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const docs = [
  { id: "intro", title: "المقدمة", content: "نص فيه بصائر عن الكون", slug: "intro" },
];

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ json: async () => docs });
  vi.stubGlobal("fetch", fetchMock);
  document.body.style.overflow = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("SearchDialog accessibility", () => {
  it("closes on Escape even when the input is not focused", () => {
    const onClose = vi.fn();
    render(<SearchDialog isOpen onClose={onClose} />);

    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });

  it("locks body scroll while open and restores it on close", () => {
    const { rerender } = render(<SearchDialog isOpen onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<SearchDialog isOpen={false} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("exposes combobox semantics and tracks the active option", async () => {
    const { getByRole } = render(<SearchDialog isOpen onClose={() => {}} />);

    const input = getByRole("combobox");
    expect(input).toHaveAttribute("aria-controls", "search-results");
    expect(input).toHaveAttribute("aria-autocomplete", "list");

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));

    fireEvent.change(input, { target: { value: "بصائر" } });

    await waitFor(() => expect(getByRole("option")).toBeInTheDocument());

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", "search-result-0");
  });
});
