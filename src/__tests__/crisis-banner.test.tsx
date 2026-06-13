import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrisisBanner } from "@/components/chat/CrisisBanner";
import { CRISIS_HELPLINES, formatHelplineMessage } from "@/lib/safety";

describe("CrisisBanner", () => {
  it("renders with role=alert so screen readers announce it immediately", () => {
    render(<CrisisBanner content="Help is available." />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("displays the 'not alone' heading", () => {
    render(<CrisisBanner content="Any content" />);
    expect(screen.getByText(/you're not alone/i)).toBeInTheDocument();
  });

  it("renders the passed content text", () => {
    render(<CrisisBanner content="Call Tele-MANAS 14416 for help." />);
    expect(screen.getByText(/call tele-manas 14416/i)).toBeInTheDocument();
  });

  it("strips markdown bold markers from content via toPlainText", () => {
    render(<CrisisBanner content="**Important**: reach out now." />);
    expect(screen.getByText(/important: reach out now/i)).toBeInTheDocument();
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
  });

  it("renders correctly when given the formatted helpline message", () => {
    const helplineMessage = formatHelplineMessage();
    render(<CrisisBanner content={helplineMessage} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();

    for (const helpline of CRISIS_HELPLINES) {
      expect(screen.getByText(new RegExp(helpline.number))).toBeInTheDocument();
    }
  });
});
