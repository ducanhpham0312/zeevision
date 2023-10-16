import { Modal } from "@mui/base/Modal";
import { Box, styled } from "@mui/system";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import React from "react";
import { PRIMARY } from "../../theme/palette";
import { useModalStore } from "../../contexts/modalStore";

interface DragDropFileProps {}

export const DragDropFile: React.FC<DragDropFileProps> = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [openModal] = useModalStore((state) => [state.openModal]);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Only accept bpmn files
      if (
        acceptedFiles.length > 0 &&
        acceptedFiles[0].name!.endsWith(".bpmn")
      ) {
        setFile(acceptedFiles[0]);
        console.log(acceptedFiles[0]);
      }
      // Open the modal upon successful file drop
      setIsDragActive(false);
      openModal();
    },
    [openModal]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragOver: () => setIsDragActive(true),
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    noClick: true,
    noKeyboard: true,
  });

  return (
    <DropzoneArea
      {...getRootProps()}
      sx={{
        position: "fixed",
        height: "100vh",
        top: 0,
        width: "100vw",
        boxSizing: "border-box",
      }}
    >
      <input {...getInputProps()} />
      <StyledModal
        sx={{ pointerEvents: "none" }}
        open={isDragActive}
        onClose={() => setIsDragActive(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <StyledBox>
          <p id="simple-modal-description">Drop files here to upload!</p>
          <em>(Only *.bmpn files will be accepted)</em>
        </StyledBox>
      </StyledModal>
    </DropzoneArea>
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
const DropzoneArea = styled(Box)<{ isDragActive: boolean }>`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: ${(props) => (props.isDragActive ? "1300" : "-1")};
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
