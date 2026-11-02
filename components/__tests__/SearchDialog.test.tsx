import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import SearchDialog from "@/components/SearchDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SearchDialog index loading", () => {
  it("does not fetch the search index while closed", async () => {
    render(<SearchDialog isOpen={false} onClose={() => {}} />);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the index once when first opened", async () => {
    const { rerender } = render(<SearchDialog isOpen={false} onClose={() => {}} />);

    rerender(<SearchDialog isOpen onClose={() => {}} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/search-data.json");

    rerender(<SearchDialog isOpen={false} onClose={() => {}} />);
    rerender(<SearchDialog isOpen onClose={() => {}} />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
