import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Popup } from "./Popup";
import { Button } from "../Button";
import * as mockdata from "./mockdata.json";

describe("Popup Component", () => {
  const mockOnClose = jest.fn();

  it("renders correctly when open", () => {
    const { baseElement } = render(
      <Popup {...mockdata.openPopup} onClose={mockOnClose} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("does not render when closed", () => {
    const { baseElement } = render(
      <Popup {...mockdata.closedPopup} onClose={mockOnClose} />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<Popup {...mockdata.openPopup} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the title correctly", () => {
    render(<Popup {...mockdata.openPopup} onClose={mockOnClose} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(<Popup {...mockdata.openPopup} onClose={mockOnClose} />);
    expect(screen.getByText(/Test child 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test child 2/)).toBeInTheDocument();
  });

  it("renders a button with correct text and form of Button Component inside the Popup", () => {
    const buttonText = "Click Me!";
    render(
      <Popup {...mockdata.openPopup}>
        <p>Test child 1</p>
        <p>Test child 2</p>
        <Button>{buttonText}</Button>
      </Popup>
    );

    expect(screen.getByText(buttonText)).toBeInTheDocument();
  });

  it("Backdrop displays correctly when the popup is open", () => {
    render(<Popup {...mockdata.openPopup} onClose={mockOnClose} />);
    const backdrop = screen.getByRole("presentation");
    expect(backdrop).toHaveStyle({
      position: "fixed",
      inset: "0",
      backgroundColor: "rgb(0 0 0 / 0.5)",
    });
  });
});
