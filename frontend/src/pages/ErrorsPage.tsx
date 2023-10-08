import { useState } from "react";
import { Popup, PopupAction, PopupContent } from "../components/popup/Popup";
import { styled } from "@mui/system";
import { StyledButton } from "../components/styled-component/StyledButton";
import { Style } from "@mui/icons-material";

export default function ErrorsPage() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <h1>ErrorsPage</h1>
      <StyledButton onClick={handleOpen}>Open Modal dey</StyledButton>
      <Popup open={open} onClose={handleClose} title={"Deploy a process"}>
        <PopupContent>
          <StyledButton>Deploy a file </StyledButton>
          <p>Or drag the files to the box belows</p>
          <p>hi</p>
        </PopupContent>
        <PopupAction>
          <StyledButton onClick={handleClose}>Cancel</StyledButton>
          <StyledButton variant="contained">Deploy process</StyledButton>
        </PopupAction>
      </Popup>
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
