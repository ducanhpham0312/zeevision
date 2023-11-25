import "@testing-library/jest-dom";
import { render, fireEvent, screen } from "@testing-library/react";
import { Popup } from "./Popup";
import { Button } from "../Button";
import * as mockdata from "./mockdata.json";

const openPopup = mockdata.openPopup;
const closedPopup = mockdata.closedPopup;

describe("Popup Component", () => {
  const mockOnClose = jest.fn();

  it("renders correctly when open", () => {
    const { baseElement } = render(
      <Popup {...openPopup} onClose={mockOnClose} />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("does not render when closed", () => {
    const { baseElement } = render(
      <Popup {...closedPopup} onClose={mockOnClose} />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<Popup {...openPopup} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the title correctly", () => {
    render(<Popup {...openPopup} onClose={mockOnClose} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(<Popup {...openPopup} onClose={mockOnClose} />);
    expect(screen.getByText(/Test child 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test child 2/)).toBeInTheDocument();
  });

  it("renders a button with correct text and form of Button Component inside the Popup", () => {
    const buttonText = "Click Me!";
    render(
      <Popup {...openPopup}>
        <p>Test child 1</p>
        <p>Test child 2</p>
        <Button>{buttonText}</Button>
      </Popup>,
    );

    expect(screen.getByText(buttonText)).toBeInTheDocument();
  });

  it("Backdrop displays correctly when the popup is open", () => {
    render(<Popup {...openPopup} onClose={mockOnClose} />);
    const backdrop = screen.getByRole("presentation");
    expect(backdrop).toHaveClass("fixed", "inset-0");
  });
});
