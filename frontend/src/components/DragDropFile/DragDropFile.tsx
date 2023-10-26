import { Modal } from "@mui/base/Modal";
import { Box, styled } from "@mui/system";

import React, { useEffect } from "react";
import { PRIMARY } from "../../theme/palette";
import { useDragDrop } from "../../hooks/useDragDrop";
import { readFileToString } from "../../utils/readFileToString";
import { useUIStore } from "../../contexts/useUIStore";

interface DragDropFileProps {
  /**
   * Callback function that is triggered when a file is dropped.
   *
   * @param fileContent - The content of the dropped file as a string.
   */
  onFileDropped: (file: string) => void;
}

export const DragDropFile: React.FC<DragDropFileProps> = ({
  onFileDropped,
}) => {
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
    <StyledModal
      sx={{ pointerEvents: "none" }}
      open={dragging}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <StyledBox>
        <p id="simple-modal-description">Drop files here to upload!</p>
        <em>(Only *.bmpn files will be accepted)</em>
      </StyledBox>
    </StyledModal>
  );
};

export const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledBox = styled(Box)`
  width: 400px;
  height: 200px;
  border: 3px solid ${PRIMARY[600]};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e8f8ff;
  cursor: pointer;
  margin: 16px;

  p {
    color: ${PRIMARY[300]};
    font-size: 16px;
    text-align: center;
  }
`;
