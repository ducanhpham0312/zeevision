import { Modal, ModalProps } from "@mui/base";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { animated, useSpring } from "@react-spring/web";
import React, { MouseEventHandler, forwardRef } from "react";
import { Button } from "../Button";

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
        closeAfterTransition
      >
        <Fade in={props.open}>
          <PopupContainer>
            <PopupTitle>
              <p>{title}</p>
              <Button variant={"text"} onClick={props.onClose as () => void}>
                <CloseIcon />
              </Button>
            </PopupTitle>
            {children}
          </PopupContainer>
        </Fade>
      </StyledModal>
    </div>
  );
};

interface FadeProps {
  children: React.ReactElement;
  in?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
  onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
  onExited?: (node: HTMLElement, isAppearing: boolean) => void;
}

const Fade = forwardRef<HTMLDivElement, FadeProps>(function Fade(props, ref) {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    config: { duration: 150 },
    onStart: () => {
      if (open && onEnter) {
        onEnter(null as unknown as HTMLElement, true);
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited(null as unknown as HTMLElement, true);
      }
    },
  });
  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  );
});

const Backdrop = forwardRef<
  HTMLDivElement,
  { children: React.ReactElement; open: boolean }
>((props, ref) => {
  const { open, ...other } = props;
  return <Fade ref={ref} in={open} {...other} />;
});

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
  max-height: 500px;
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
