import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AgentSettings from "../AgentSettings";

describe("AgentSettings", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <AgentSettings />
      </MemoryRouter>
    );
  }

  it("renders the page header", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /business information/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /this business information gives rosie the context to handle your calls/i
      )
    ).toBeInTheDocument();
  });

  it("shows the navigation tabs", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: /business information/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /agent profile/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /greeting/i })
    ).toBeInTheDocument();
  });

  it("renders key sections for business information", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /training sources/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /business details/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /core services/i })
    ).toBeInTheDocument();
  });
});
