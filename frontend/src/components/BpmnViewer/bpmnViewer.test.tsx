import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import { BpmnViewer, ResponsiveBpmnViewer } from "./BpmnViewer";
import Viewer from "bpmn-js/lib/Viewer";
import * as mockdata from "./mockdata.json";

// Mock class constructor for NavigatedViewer
jest.mock("bpmn-js/lib/NavigatedViewer", () => {
  return {
    __esModule: true, // ESModule compatibility
    default: jest.fn().mockImplementation(() => {
      return {
        // Mock methods and properties
        importXML: jest.fn(),
        destroy: jest.fn(),
        get: jest.fn().mockReturnValue({
          viewbox: () => ({ inner: {}, outer: {} }),
          zoom: jest.fn(),
        }),
      };
    }),
  };
});

// Mock class constructor for Viewer
jest.mock("bpmn-js/lib/Viewer", () => {
  return {
    __esModule: true, // ESModule compatibility
    default: jest.fn().mockImplementation(() => {
      return {
        // Mock methods and properties
        importXML: jest.fn(),
        destroy: jest.fn(),
        get: jest.fn().mockReturnValue({
          viewbox: () => ({ inner: {}, outer: {} }),
          zoom: jest.fn(),
        }),
      };
    }),
  };
});

describe("BpmnViewer Component", () => {
  it("correctly render the snapshot", () => {
    const { asFragment } = render(<BpmnViewer {...mockdata.primary} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders and initializes bpmn-js viewer", async () => {
    const { getByTestId } = render(<BpmnViewer {...mockdata.primary} />);
    await waitFor(() => {
      expect(getByTestId("canvas")).toBeInTheDocument();
    });
  });

  it("uses NavigatedViewer when navigated prop is true", async () => {
    render(<BpmnViewer {...mockdata.primary} />);
    await waitFor(() => {
      expect(NavigatedViewer).toHaveBeenCalled();
    });
  });

  it("uses Viewer when navigated prop is false", async () => {
    render(<BpmnViewer {...mockdata.secondary} />);
    await waitFor(() => {
      expect(Viewer).toHaveBeenCalled();
    });
  });
});

describe("ResponsiveBpmnViewer", () => {
  it("correctly render the ResponsiveBpmnViewer snapshot", () => {
    const { asFragment } = render(
      <ResponsiveBpmnViewer {...mockdata.moneyLoan} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not throw error when bpmnString is empty", () => {
    const { asFragment } = render(<ResponsiveBpmnViewer bpmnString="" />);
    expect(asFragment()).not.toBeNull;
  });

  it("zoom button is visible", () => {
    const { getAllByRole } = render(
      <ResponsiveBpmnViewer {...mockdata.moneyLoan} />,
    );
    expect(getAllByRole("button")[0]).toBeInTheDocument();
  });
});
