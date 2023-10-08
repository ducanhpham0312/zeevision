import React from "react";
import clsx from "clsx";
import { Modal, ModalProps } from "@mui/base";
import { styled } from "@mui/system";
import { StyledButton } from "../styled-component/StyledButton";
import CloseIcon from "@mui/icons-material/Close";

interface PopupProps extends Omit<ModalProps, "children"> {
  title: string;
  children: React.ReactNode[];
}

export const Popup: React.FC<PopupProps> = ({ title, children, ...props }) => {
  return (
    <div>
      <StyledModal
        {...props}
        slots={{ backdrop: StyledBackdrop }}
        closeAfterTransition
      >
        <PopupContainer>
          <PopupTitle>
            <p>{title}</p>
            <StyledButton
              variant={"text"}
              onClick={props.onClose as () => void}
            >
              <CloseIcon />
            </StyledButton>
          </PopupTitle>
          {children}
        </PopupContainer>
      </StyledModal>
    </div>
  );
};

const PopupTitle = styled("div")`
  display: flex;
  height: 50px;
  line-height: 5px;
  justify-content: space-between;
  padding: 10px;
  padding-left: 20px;

  p {
    font-size: 25px;
    font-weight: 700;
  }
`;

export const PopupContent = styled("div")`
  margin-top: 10px;
  flex-grow: 1;
  padding-left: 20px;
`;

export const PopupAction = styled("div")`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px;
`;

const Backdrop = React.forwardRef<
  HTMLDivElement,
  { open?: boolean; className: string }
>((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={clsx({ "MuiBackdrop-open": open }, className)}
      ref={ref}
      {...other}
    />
  );
});

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

// make this responsive
const PopupContainer = styled("div")`
  width: 800px;
  border: 1px solid black;
  overflow-y: auto;
  max-height: 90%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
`;

const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
