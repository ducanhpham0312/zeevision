import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import { BpmnViewer } from "./BpmnViewer";
import Viewer from "bpmn-js/lib/Viewer";

// Mock class constructor
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
    const bpmnString = "some-bpmn-xml-string";
    const { asFragment } = render(
      <BpmnViewer bpmnString={bpmnString} navigated={true} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders and initializes bpmn-js viewer", async () => {
    const bpmnString = "some-bpmn-xml-string";

    // Render the component
    const { getByTestId } = render(
      <BpmnViewer bpmnString={bpmnString} navigated={true} />,
    );

    await waitFor(() => {
      expect(getByTestId("canvas")).toBeInTheDocument();
    });
  });

  it("uses NavigatedViewer when navigated prop is true", async () => {
    const bpmnString = "some-bpmn-xml-string";
    render(<BpmnViewer bpmnString={bpmnString} navigated={true} />);

    await waitFor(() => {
      expect(NavigatedViewer).toHaveBeenCalled();
    });
  });

  it("uses Viewer when navigated prop is false", async () => {
    const bpmnString = "some-bpmn-xml-string";
    render(<BpmnViewer bpmnString={bpmnString} navigated={false} />);

    await waitFor(() => {
      expect(Viewer).toHaveBeenCalled();
    });
  });
});
