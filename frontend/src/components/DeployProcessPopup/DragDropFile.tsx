import { Modal } from "@mui/base/Modal";

import { useEffect } from "react";
import { useDragDrop } from "../../hooks/useDragDrop";
import { readFileToString } from "../../utils/readFileToString";
import { useUIStore } from "../../contexts/useUIStore";

interface DragDropFileProps {
  /**
   * Callback function that is triggered when a file is dropped.
   *
   * @param fileContent - The content of the dropped file as a string.
   */
  onFileDropped: (fileContent: string) => void;
}

export function DragDropFile({ onFileDropped }: DragDropFileProps) {
  const { dragging, file } = useDragDrop();
  const { setSnackbarContent } = useUIStore();

  useEffect(() => {
    const setFile = async () => {
      if (file) {
        if (file.name.endsWith(".bpmn")) {
          onFileDropped(await readFileToString(file));
        } else {
          setSnackbarContent({
            title: "Invalid file type",
            message: "The file was not .bpmn file",
            type: "error",
          });
        }
      }
    };

    setFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <Modal
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      open={dragging}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div className="flex h-[200px] w-[400px] flex-col items-center justify-center rounded border-[3px] border-text">
        <p id="simple-modal-description">Drop files here to upload!</p>
        <em>(Only *.bmpn files will be accepted)</em>
      </div>
    </Modal>
  );
}
