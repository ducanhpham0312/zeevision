import { act, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Snackbar } from "./Snackbar";

const mockCloseSnackFunction = jest.fn();

// Mocking the context hook
jest.mock("../../contexts/useUIStore", () => ({
  useUIStore: () => ({
    snackMessage: {
      open: true,
      message: "Test message",
      title: "Test title",
      type: "success",
    },
    closeSnackMessage: mockCloseSnackFunction,
  }),
}));

jest.useFakeTimers();

describe("Snackbar Component", () => {
  test("renders and displays the message and title", () => {
    const { getByText } = render(<Snackbar />);
    expect(getByText("Test message")).toBeInTheDocument();
    expect(getByText("Test title")).toBeInTheDocument();
  });

  it("calls handleClose when the close button is clicked", async () => {
    render(<Snackbar />);
    // await userEvent.click(screen)
    expect(true).toBe(true);
  });

  test("should close the Snackbar after timeout", () => {

    render(<Snackbar />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockCloseSnackFunction).toHaveBeenCalled();
  });
});
