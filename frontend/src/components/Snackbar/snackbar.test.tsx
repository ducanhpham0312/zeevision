import { act, fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Snackbar } from "./Snackbar";
import { SnackMessageType } from "../../contexts/useUIStore";

const mockCloseSnackFunction = jest.fn();

// Mocking the context hook
jest.mock("../../contexts/useUIStore", () => ({
  useUIStore: jest.fn(),
}));

jest.useFakeTimers();

const getSnackbarContentByType = (type: SnackMessageType["type"]) => {
  return {
    open: true,
    message: "Default message",
    title: "Default title",
    type,
  };
};

describe("Snackbar Component", () => {
  beforeEach(() => {
    mockCloseSnackFunction.mockClear();
    // Reset the mock implementation before each test

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../contexts/useUIStore").useUIStore.mockImplementation(() => ({
      snackbarContent: getSnackbarContentByType("success"),
      closeSnackBar: mockCloseSnackFunction,
    }));
  });

  it("renders and displays the message and title", () => {
    const { getByText } = render(<Snackbar />);
    expect(getByText("Default message")).toBeInTheDocument();
    expect(getByText("Default title")).toBeInTheDocument();
  });

  it("renders success icon when type is 'success'", () => {
    const { container } = render(<Snackbar />);
    expect(container.querySelector(".success-icon")).toBeInTheDocument();
  });

  it("renders error icon when type is 'error'", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../contexts/useUIStore").useUIStore.mockImplementation(() => ({
      snackbarContent: getSnackbarContentByType("error"),
      closeSnackBar: mockCloseSnackFunction,
    }));
    const { container } = render(<Snackbar />);
    expect(container.querySelector(".error-icon")).toBeInTheDocument();
  });

  it("calls closeSnackBar when close button is clicked", async () => {
    const { getByRole } = render(<Snackbar />);
    const closeButton = getByRole("button");

    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(mockCloseSnackFunction).toBeCalledTimes(1); // Ensure that the function was called once
  });

  it("should close the Snackbar after timeout", () => {
    render(<Snackbar />);
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(mockCloseSnackFunction).toHaveBeenCalled();
  });
});
