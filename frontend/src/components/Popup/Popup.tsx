import { Modal, ModalProps } from "@mui/base";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { animated, useSpring } from "@react-spring/web";
import React, { MouseEventHandler, forwardRef } from "react";
import { Button } from "../Button";

export interface PopupProps extends Omit<ModalProps, "children"> {
  /**
   * The title displayed at the top of the popup.
   */
  title: string;

  /**
   *  Elements or components displayed inside the popup.
   */
  children: React.ReactNode[];

  /**
   *  Determines if the popup is visible.
   */
  open: boolean;

  /**
   * Determines if the modal will stay open when user click outside the modal
   */
  shouldNotCloseWhenClickAway?: boolean;
}

export function Popup({
  title,
  children,
  shouldNotCloseWhenClickAway,
  ...props
}: PopupProps) {
  return (
    <div>
      <Modal
        {...props}
        className="fixed inset-0 z-50 flex w-full items-center justify-center"
        onClose={shouldNotCloseWhenClickAway ? () => {} : props.onClose}
        slots={{ backdrop: StyledBackdrop }}
        closeAfterTransition
      >
        <Fade in={props.open}>
          <div className="tablet:w-[750px] flex max-h-[90%] min-h-[300px] w-[90vw] flex-col overflow-y-auto rounded bg-background">
            <div className="flex items-center justify-between px-[20px] py-[10px] pl-[20px] text-2xl">
              <p>{title}</p>
              <Button onClick={props.onClose as () => void}>
                <CloseIcon />
              </Button>
            </div>
            {children}
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

interface FadeProps {
  children: React.ReactElement;
  in?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
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

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;
