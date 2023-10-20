import { Modal } from "@mui/base/Modal";
import { Box, styled } from "@mui/system";

import React, { useEffect } from "react";
import { PRIMARY } from "../../theme/palette";
import { useDragDrop } from "../../hooks/useDragDrop";
import { ReadBpmnFileToString } from "../../utils/ReadBpmnFileToString";

interface DragDropFileProps {
  onFileDropped: (file: string) => void;
}

export const DragDropFile: React.FC<DragDropFileProps> = ({
  onFileDropped,
}) => {
  const { dragging, file } = useDragDrop();

  useEffect(() => {
    ReadBpmnFileToString(file, onFileDropped);

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

const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBox = styled(Box)`
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
