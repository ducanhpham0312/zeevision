import * as React from "react";
import { Transition } from "react-transition-group";
import { twMerge } from "tailwind-merge";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import { Snackbar as SnackbarMUI } from "@mui/base/Snackbar";
import { SnackMessageType, useUIStore } from "../../contexts/useUIStore";
import { SnackbarCloseReason } from "@mui/base";
import { VariantProps, tv } from "tailwind-variants";

const SNACKBAR_AUTO_CLOSE_MS = 5000;

type TransitionStatus =
  | "entering"
  | "entered"
  | "exiting"
  | "exited"
  | "unmounted";

interface SnackbarContentProps
  extends VariantProps<typeof snackbarContentVariant> {
  /**
   * The message to be displayed within the snackbar.
   */
  message: SnackMessageType["message"];
  /**
   * The title of the snackbar.
   */
  title: SnackMessageType["title"];
  /**
   * The type of the snackbar which determines its appearance and icon.
   * For example, 'error' or 'success'.
   */
  type: SnackMessageType["type"];
  /**
   * The status of the transition states which affect snackbar visibility and positioning.
   */
  status: TransitionStatus;
  /**
   * A mutable ref object which is used to manage the component's
   * render cycle and avoid potential issues during transition phases.
   */
  nodeRef?: React.MutableRefObject<null>;

  messageNode?: React.ReactNode;

  className?: string;
  /**
   * A function that handles the closing of the snackbar.
   * It can be triggered by a user action (e.g., clicking a button)
   * or programmatically, depending on the implementation.
   *
   * @param _: Event or null - The triggering event or null if closed programmatically.
   * @param reason: SnackbarCloseReason - Describes why the snackbar is being closed.
   */
  handleClose: (_: Event | null, reason: SnackbarCloseReason) => void;
}

export function Snackbar() {
  const { snackbarContent, closeSnackBar } = useUIStore();
  const { messageNode, open, message, title, type } = snackbarContent;
  const [exited, setExited] = React.useState(true);
  const timeoutId = React.useRef<number | undefined>();
  const nodeRef = React.useRef(null);

  const handleClose = (_: Event | null, reason: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return;
    }
    closeSnackBar();
  };

  const handleOnEnter = () => {
    setExited(false);
  };

  const handleOnExited = () => {
    setExited(true);
  };

  React.useEffect(() => {
    if (open) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(() => {
        closeSnackBar();
      }, SNACKBAR_AUTO_CLOSE_MS) as unknown as number;
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [snackbarContent, closeSnackBar, open]);

  return (
    <SnackbarMUI
      className="fixed bottom-4 right-4 z-50 flex min-w-[360px] max-w-[560px]"
      open={open}
      onClose={handleClose as () => void}
      exited={exited}
    >
      <Transition
        timeout={{ enter: 400, exit: 400 }}
        in={open}
        appear
        unmountOnExit
        onEnter={handleOnEnter}
        onExited={handleOnExited}
        nodeRef={nodeRef}
      >
        {(status) => (
          <SnackbarContent
            type={type}
            title={title}
            message={message}
            messageNode={messageNode}
            status={status}
            handleClose={handleClose}
            nodeRef={nodeRef}
          />
        )}
      </Transition>
    </SnackbarMUI>
  );
}

export function SnackbarContent({
  type,
  status,
  title,
  message,
  handleClose,
  nodeRef,
  className,
  messageNode,
}: SnackbarContentProps) {
  return (
    <div
      className={twMerge(snackbarContentVariant({ type }), className)}
      style={{
        transform: positioningStyles[status],
        transition: "transform 300ms ease",
        alignContent: "start",
      }}
      ref={nodeRef}
    >
      {type === "success" ? (
        <CheckRoundedIcon
          className="success-icon"
          sx={{
            color: "white",
            flexShrink: 0,
            width: "1.25rem",
            height: "1.5rem",
          }}
        />
      ) : (
        <ErrorIcon
          className="error-icon"
          sx={{
            color: "white",
            flexShrink: 0,
            width: "1.25rem",
            height: "1.5rem",
          }}
        />
      )}
      <div className="flex flex-col max-w-full">
        <p className="snackbar-title">{title}</p>
        {messageNode ? (
          messageNode
        ) : (
          <p className="snackbar-description">{message}</p>
        )}
      </div>

      <button
        className="close-button"
        style={{ all: "unset", height: "24px" }}
        onClick={handleClose as () => void}
      >
        <CloseIcon sx={{ fontSize: "20px" }} className="snackbar-close-icon" />
      </button>
    </div>
  );
}

const snackbarContentVariant = tv({
  base: "flex gap-2 p-4 overflow-hidden rounded text-white",
  variants: {
    type: {
      success: "bg-sucess",
      error: "bg-error",
    },
  },
});

const positioningStyles = {
  entering: "translateX(0)",
  entered: "translateX(0)",
  exiting: "translateX(110%)",
  exited: "translateX(110%)",
  unmounted: "translateX(110%)",
};
