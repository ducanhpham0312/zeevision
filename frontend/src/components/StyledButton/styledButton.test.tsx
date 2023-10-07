import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { StyledButton } from "./StyledButton";

describe("StyledButton Component", () => {
  it("renders correctly", () => {
    render(<StyledButton label="Click me" />);
    expect(screen.getByText("Click me"));
  });

  it("renders children when passed", () => {
    render(<StyledButton>Children</StyledButton>);
    expect(screen.getByText("Children")).toBeInTheDocument();
  });

  it("renders label over children when both are passed", () => {
    render(<StyledButton label="Label">Children</StyledButton>);
    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });

  it("handles click event", async () => {
    const handleClick = jest.fn();
    render(<StyledButton onClick={handleClick} label="Click me" />);
    await userEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
});
