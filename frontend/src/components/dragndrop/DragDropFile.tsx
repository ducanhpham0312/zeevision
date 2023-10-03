import { Modal } from "@mui/base/Modal";
import { Box, styled } from "@mui/system";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import React from "react";

interface DragDropFileProps {}

export const DragDropFile: React.FC<DragDropFileProps> = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only accept bpmn files
    if (acceptedFiles.length > 0 && acceptedFiles[0].name!.endsWith(".bpmn")) {
      setFile(acceptedFiles[0]);
    }
    console.log(file);
    setIsDragActive(false);
  }, []);

  useEffect(() => {
    // Function to handle drag over window
    const handleDragOver = (e: Event) => {
      e.preventDefault();
      setIsDragActive(true);
    };

    // Function to handle drag leave window
    const handleDragLeave = () => {
      setIsDragActive(false);
    };

    // Adding event listeners
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDragLeave);

    // Removing event listeners on component unmount
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDragLeave);
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true, // Prevent file dialog on click
    noKeyboard: true, // Prevent keyboard navigation
  });

  return (
    <div
      style={{
        display: "none",
        position: "fixed",
        height: "100vh",
        top: 0,
        width: "100vw",
        boxSizing: "border-box",
        border: "10px solid red",
      }}
    >
      {isDragActive && (
        <DropzoneArea {...getRootProps()}>
          <input {...getInputProps()} />
          <StyledModal
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
      )}
    </div>
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
const DropzoneArea = styled(Box)`
  width: 100%;
  height: 100vh;
  border: 2px dashed lightgray;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
const StyledBox = styled(Box)`
  width: 400px;
  height: 200px;
  border: 3px dashed #97c8eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e8f8ff;
  cursor: pointer;
  margin: 16px;
  &:hover {
    border-color: #4194e0;
  }
  p {
    color: #4194e0;
    font-size: 16px;
    text-align: center;
  }
`;
