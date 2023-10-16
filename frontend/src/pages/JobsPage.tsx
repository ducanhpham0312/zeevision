import { ChangeEvent, useEffect, useRef } from "react";
import { DragDropFile } from "../components/DragDrop/DragDropFile";
import { StyledPopUpModal } from "../components/styled-component/StyledPopUpModal";
import { useModalStore } from "../contexts/modalStore";
import { styled } from "@mui/system";
export default function JobsPage() {
  const [isModalOpen, openModal, closeModal] = useModalStore((state) => [
    state.isModalOpen,
    state.openModal,
    state.closeModal,
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    console.log("Modal state:", isModalOpen);
  }, [isModalOpen]);

  const handleFileUploadClick = () => {
    openModal();
    // click on file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0 && files[0].name!.endsWith(".bpmn")) {
      console.log("Selected file:", files[0].name);
    }
  }
  return (
    <>
      <h1>JobsPage</h1>
      <DragDropFile />
      <TriggerButton type="button" onClick={handleFileUploadClick}>
        Upload the file
      </TriggerButton>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <StyledPopUpModal open={isModalOpen} onClose={closeModal}>
        <h2>Modal Content Here</h2>
      </StyledPopUpModal>
    </>
  );
}

const blue = {
  200: "#99CCF3",
  400: "#3399FF",
  500: "#007FFF",
};

const grey = {
  50: "#f6f8fa",
  100: "#eaeef2",
  200: "#d0d7de",
  300: "#afb8c1",
  400: "#8c959f",
  500: "#6e7781",
  600: "#57606a",
  700: "#424a53",
  800: "#32383f",
  900: "#24292f",
};

const TriggerButton = styled("button")(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  box-sizing: border-box;
  min-height: calc(1.5em + 22px);
  border-radius: 12px;
  padding: 6px 12px;
  line-height: 1.5;
  background: transparent;
  border: 1px solid ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[100] : grey[900]};

  &:hover {
    background: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
  }

  &:focus-visible {
    border-color: ${blue[400]};
    outline: 3px solid ${theme.palette.mode === "dark" ? blue[500] : blue[200]};
  }
  `
);