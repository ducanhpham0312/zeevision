import React, { forwardRef } from "react";
// import clsx from "clsx";
import { Modal, ModalProps } from "@mui/base";
import { styled } from "@mui/system";
import { Button } from "../Button";
import CloseIcon from "@mui/icons-material/Close";

export interface PopupProps extends Omit<ModalProps, "children"> {
  title: string;
  children: React.ReactNode[];
}

export const Popup: React.FC<PopupProps> = ({ title, children, ...props }) => {
  return (
    <div>
      <StyledModal
        {...props}
        slots={{ backdrop: StyledBackdrop }}
        // closeAfterTransition
      >
        <PopupContainer>
          <PopupTitle>
            <p>{title}</p>
            <Button variant={"text"} onClick={props.onClose as () => void}>
              <CloseIcon />
            </Button>
          </PopupTitle>
          {children}
        </PopupContainer>
      </StyledModal>
    </div>
  );
};

export const PopupTitle = styled("div")`
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
  overflow-y: scroll;
  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 20px;
  }
`;

export const PopupAction = styled("div")`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px;
`;

const Backdrop = forwardRef<
  HTMLDivElement,
  { open?: boolean; className: string }
>((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      // className={clsx({ "MuiBackdrop-open": open }, className)}
      className={className}
      ref={ref}
      {...other}
    />
  );
});

export const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

// make this responsive
export const PopupContainer = styled("div")`
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

export const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
