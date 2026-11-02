import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  vi.stubGlobal("fetch", fetchMock);
  document.body.style.overflow = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("SearchDialog index failure", () => {
  it("shows an error and retries loading the index", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    fetchMock.mockResolvedValue({ ok: true, json: async () => docs });

    render(<SearchDialog isOpen onClose={() => {}} />);

    expect(await screen.findByText("تعذر تحميل فهرس البحث")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "إعادة المحاولة" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "بصائر" } });

    await waitFor(() => expect(screen.getByRole("option")).toBeInTheDocument(), {
      timeout: 2000,
    });
  });
});
