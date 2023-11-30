import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import { BpmnViewer } from "./BpmnViewer";
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
    // Render the component
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
