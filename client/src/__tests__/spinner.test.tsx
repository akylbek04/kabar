import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../components/ui/spinner";

describe("Spinner", () => {
  it("renders with the loading role", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<Spinner />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Spinner className="w-10 h-10" />);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("w-10");
    expect(el).toHaveClass("h-10");
  });
});
