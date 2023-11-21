import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeployProcessPopup } from ".";
import * as mockdata from "./mockdata.json";
import { Button } from "../Button";
import { DragDropFile } from "./DragDropFile";

const fileContent = mockdata.file.content;
const fileName = mockdata.file.name;
const fileType = mockdata.file.type;

jest.mock("../../hooks/useDragDrop", () => {
  const useDragDropMock = jest.fn(() => ({
    dragging: true,
    file: new File([fileContent], fileName, { type: fileType }),
  }));

  return { useDragDrop: useDragDropMock };
  // Mocking a problematic component
});
jest.mock("../BpmnViewer/BpmnViewer.tsx", () => {
  return {
    __esModule: true,
    BpmnViewer: jest.fn(() => <div>BpmnViewer Mock</div>),
    ResponsiveBpmnViewer: jest.fn(() => <div>BpmnViewer Mock</div>),
  };
});

describe("DeployProcessPopup Component", () => {
  let handleOpen: jest.Mock<void, []>, handleClose: jest.Mock<void, []>;

  beforeEach(() => {
    handleOpen = jest.fn();
    handleClose = jest.fn();
  });

  it("renders the popup correctly when a file is dragged over", () => {
    const { baseElement } = render(
      <DeployProcessPopup
        isPopUpOpen={true}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />,
    );

    const file = new File([fileContent], fileName, { type: fileType });

    fireEvent.dragOver(document);
    fireEvent.drop(document, { dataTransfer: { files: [file] } });

    expect(baseElement).toMatchSnapshot();
  });

  it("should display the modal when 'Deploy a Process' button is clicked", () => {
    render(
      <>
        <Button onClick={handleOpen}>Deploy a Process</Button>
        <DeployProcessPopup
          isPopUpOpen={false}
          onOpenPopUp={handleOpen}
          onClosePopUp={handleClose}
        />
      </>,
    );
    fireEvent.click(screen.getByText("Deploy a Process"));
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it("should trigger the file input when 'Deploy a file' button in Popup is clicked", () => {
    render(
      <DeployProcessPopup
        isPopUpOpen={true}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />,
    );

    const fileInput = screen.getByTestId("file-input");
    const mockFileInputClick = jest.spyOn(fileInput, "click");

    fireEvent.click(screen.getByText("Upload a file (.bpmn)"));

    expect(mockFileInputClick).toHaveBeenCalled();

    // Clean up after the test
    mockFileInputClick.mockRestore();
  });

  it("renders Bpmn view when a file is uploaded via 'Deploy a file' button in Popup", async () => {
    render(
      <DeployProcessPopup
        isPopUpOpen={true}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />,
    );

    // Mocking the file input change event to simulate a file upload
    const fileInput = screen.getByTestId("file-input");
    const file = new File([fileContent], fileName, { type: fileType });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the mock BpmnViewer to be in the document
    await waitFor(() => {
      expect(screen.getByText("BpmnViewer Mock")).toBeInTheDocument();
    });
  });

  it("renders Bpmn view when a file is uploaded via drag and drop in window", async () => {
    render(
      <DeployProcessPopup
        isPopUpOpen={true}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />,
    );

    const file = new File([fileContent], fileName, { type: fileType });

    fireEvent.dragOver(document);
    fireEvent.drop(document, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      const bpmnViewerElement = screen.getByText("BpmnViewer Mock");
      expect(bpmnViewerElement).toBeInTheDocument();
    });
  });

  it("renders Bpmn view when a file is uploaded via drag and drop in Popup", async () => {
    render(
      <DeployProcessPopup
        isPopUpOpen={true}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />,
    );

    const file = new File([fileContent], fileName, { type: fileType });

    // Drop zone in Popup
    const dropZone = screen.getByText("Or drag a bpmn file here");

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      const bpmnViewerElement = screen.getByText("BpmnViewer Mock");
      expect(bpmnViewerElement).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <DeployProcessPopup
        isPopUpOpen={true}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe("DragDropFile", () => {
  let onFileDropped: jest.Mock<void, []>;

  beforeEach(() => {
    onFileDropped = jest.fn();
  });

  it("shows the modal when dragging", () => {
    render(<DragDropFile onFileDropped={onFileDropped} />);

    expect(screen.getByText("Drop files here to upload!")).toBeInTheDocument();
  });

  it("calls onFileDropped when a file is dropped", async () => {
    render(<DragDropFile onFileDropped={onFileDropped} />);

    const file = new File([fileContent], fileName, { type: fileType });
    fireEvent.drop(document, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(onFileDropped).toHaveBeenCalledWith(fileContent);
    });
  });
});
