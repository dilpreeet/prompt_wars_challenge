import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrisisBanner } from "@/components/chat/CrisisBanner";
import { CRISIS_HELPLINES } from "@/lib/safety";

describe("CrisisBanner", () => {
  it("renders with role=alert so screen readers announce it immediately", () => {
    render(<CrisisBanner />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("displays the 'not alone' heading", () => {
    render(<CrisisBanner />);
    expect(screen.getByText(/you're not alone/i)).toBeInTheDocument();
  });

  it("renders all India crisis helpline names and numbers", () => {
    render(<CrisisBanner />);
    for (const helpline of CRISIS_HELPLINES) {
      expect(screen.getByText(new RegExp(helpline.number))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(helpline.name))).toBeInTheDocument();
    }
  });

  it("renders emergency 112 instruction", () => {
    render(<CrisisBanner />);
    expect(screen.getByText(/112/)).toBeInTheDocument();
  });

  it("helpline numbers are clickable tel: links", () => {
    render(<CrisisBanner />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(CRISIS_HELPLINES.length);
    expect(links[0]).toHaveAttribute("href", expect.stringContaining("tel:"));
  });
});
