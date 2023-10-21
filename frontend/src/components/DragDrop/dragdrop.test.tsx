import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DragDropFile } from "./DragDropFile";
import * as mockdata from "./mockdata.json";

const fileContent = mockdata.file.content;
const fileName = mockdata.file.name;
const fileType = mockdata.file.type;

jest.mock("../../hooks/useDragDrop", () => {
  const useDragDropMock = jest.fn(() => ({
    dragging: true,
    file: new File([fileContent], fileName, { type: fileType }),
  }));

  return { useDragDrop: useDragDropMock };
});

describe("DragDropFile Component", () => {
  it("renders correctly the opening modal when drag file event triggers", () => {
    const { baseElement } = render(<DragDropFile onFileDropped={jest.fn()} />);

    const file = new File([fileContent], fileName, { type: fileType });

    fireEvent.dragOver(document);
    fireEvent.drop(document, { dataTransfer: { files: [file] } });
    expect(baseElement).toMatchSnapshot();
  });

  it("shows the modal when dragging", () => {
    const onFileDropped = jest.fn();

    render(<DragDropFile onFileDropped={onFileDropped} />);

    expect(screen.getByText("Drop files here to upload!")).toBeInTheDocument();
  });

  it("calls onFileDropped when a file is dropped", async () => {
    const onFileDropped = jest.fn();

    render(<DragDropFile onFileDropped={onFileDropped} />);

    const file = new File([fileContent], fileName, { type: fileType });

    fireEvent.drop(document, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(onFileDropped).toHaveBeenCalledWith(fileContent);
    });
  });
});
