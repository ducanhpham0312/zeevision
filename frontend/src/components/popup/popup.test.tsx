import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Popup } from "./Popup";

describe("Popup Component", () => {
  test("renders children inside the Popup", () => {
    render(
      <Popup title="Test Title" open={true} onClose={jest.fn()}>
        <p>Test child</p>
        <p>hi</p>
      </Popup>
    );

    expect(screen.getByText("Test child")).toBeInTheDocument();
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  test("renders the Popup with the correct title", () => {
    render(
      <Popup title="Test Title" open={true} onClose={jest.fn()}>
        <p>Test child</p>
        <p>hi</p>
      </Popup>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  test("calls onClose prop when close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <Popup title="Test Title" open={true} onClose={onClose}>
        <p>Test child</p>
        <p>hi</p>
      </Popup>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
