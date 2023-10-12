import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Popup } from "./Popup";
import { Button } from "../Button";

describe("Popup Component", () => {
  const mockOnClose = jest.fn();

  it("renders correctly when open", () => {
    const { asFragment } = render(
      <Popup
        open={true}
        title="Test Title"
        onClose={mockOnClose}
        children={[]}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not render when closed", () => {
    const { asFragment } = render(
      <Popup
        open={false}
        title="Test Title"
        onClose={mockOnClose}
        children={[]}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <Popup title="Test Title" open={true} onClose={onClose}>
        <p>Test child 1</p>
        <p>Test child 2</p>
      </Popup>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the title correctly", () => {
    render(
      <Popup open title="Test Title" onClose={mockOnClose} children={[]} />
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <Popup open title="Test Title" onClose={mockOnClose}>
        <div>Child Content 1</div>
        <div>Child Content 2</div>
      </Popup>
    );
    expect(screen.getByText("Child Content 1")).toBeInTheDocument();
    expect(screen.getByText("Child Content 2")).toBeInTheDocument();
  });

  it("renders a button with correct text and form of Button Component inside the Popup", () => {
    const buttonText = "Click Me!";
    render(
      <Popup open title="Popup with Button" onClose={mockOnClose}>
        <div>Child Content 1</div>
        <div>Child Content 2</div>
        <Button>{buttonText}</Button>
      </Popup>
    );

    expect(screen.getByText(buttonText)).toBeInTheDocument();
  });

  it("Backdrop displays correctly when the popup is open", () => {
    render(
      <Popup open title="Test Title" onClose={mockOnClose} children={[]} />
    );

    const backdrop = screen.getByRole("presentation"); // Assuming the backdrop has role="presentation"
    expect(backdrop).toHaveStyle({
      position: "fixed",
      inset: "0",
      backgroundColor: "rgb(0 0 0 / 0.5)",
    });
  });
});
