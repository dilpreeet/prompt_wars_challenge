import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MoodSelector } from "@/components/mood/MoodSelector";
import { MOOD_OPTIONS } from "@/components/mood/constants";

describe("MoodSelector", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ log: { id: "1" } }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an accessible radiogroup with all mood options", () => {
    render(<MoodSelector />);

    expect(
      screen.getByRole("radiogroup", { name: /how are you feeling/i }),
    ).toBeInTheDocument();

    for (const option of MOOD_OPTIONS) {
      expect(
        screen.getByRole("radio", { name: option.label }),
      ).toBeInTheDocument();
    }
  });

  it("logs mood via API when an option is clicked", async () => {
    const user = userEvent.setup();
    render(<MoodSelector />);

    await user.click(screen.getByRole("radio", { name: "Great" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/mood",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            mood: "Great",
            energy: 5,
            stress: 1,
          }),
        }),
      );
    });

    expect(
      await screen.findByText(/mood logged/i),
    ).toBeInTheDocument();
  });

  it("can activate a mood option with keyboard", async () => {
    const user = userEvent.setup();
    render(<MoodSelector />);

    const firstOption = screen.getByRole("radio", { name: "Great" });
    firstOption.focus();
    expect(firstOption).toHaveFocus();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
