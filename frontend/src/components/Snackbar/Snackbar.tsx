import * as React from "react";
import { Transition } from "react-transition-group";
import { styled } from "@mui/system";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import { Snackbar as SnackbarMUI } from "@mui/base/Snackbar";
import { PRIMARY } from "../../theme/palette";
import { SnackMessageType, useUIStore } from "../../contexts/useUIStore";
import { SnackbarCloseReason } from "@mui/base";

type TransitionStatus =
  | "entering"
  | "entered"
  | "exiting"
  | "exited"
  | "unmounted";

interface SnackbarContentProps {
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
  const { open, message, title, type } = snackbarContent;
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
      }, 3000) as unknown as number;
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [snackbarContent, closeSnackBar, open]);

  return (
    <StyledSnackbar
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
            status={status}
            handleClose={handleClose}
            nodeRef={nodeRef}
          />
        )}
      </Transition>
    </StyledSnackbar>
  );
}

export function SnackbarContent({
  type,
  status,
  title,
  message,
  handleClose,
  nodeRef,
}: SnackbarContentProps) {
  return (
    <StyledSnackbarContent
      type={type}
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
            color: PRIMARY[800],
            flexShrink: 0,
            width: "1.25rem",
            height: "1.5rem",
          }}
        />
      ) : (
        <ErrorIcon
          className="error-icon"
          sx={{
            color: "red",
            flexShrink: 0,
            width: "1.25rem",
            height: "1.5rem",
          }}
        />
      )}
      <div className="snackbar-message">
        <p className="snackbar-title">{title}</p>
        <p className="snackbar-description">{message}</p>
      </div>

      <button
        className="close-button"
        style={{ all: "unset", height: "24px" }}
        onClick={handleClose as () => void}
      >
        <CloseIcon sx={{ fontSize: "20px" }} className="snackbar-close-icon" />
      </button>
    </StyledSnackbarContent>
  );
}

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

const StyledSnackbar = styled(SnackbarMUI)`
  position: fixed;
  z-index: 5500;
  display: flex;
  bottom: 16px;
  right: 16px;
  max-width: 560px;
  min-width: 300px;
`;

const StyledSnackbarContent = styled("div")(
  ({ type }: { type: SnackMessageType["type"] }) => `
  display: flex;
  gap: 8px;
  overflow: hidden;
  background-color: ${PRIMARY[50]};
  border-radius: 4px;
  border: 1px solid ${type === "error" ? "red" : PRIMARY[300]};
  box-shadow: ${`0 2px 16px ${grey[200]}`};
  padding: 0.75rem;
  color: ${grey[900]};
  font-weight: 500;
  text-align: start;
  position: relative;
  
  & .snackbar-message {
    flex: 1 1 0%;
    max-width: 100%;
  }

  & .snackbar-title {
    margin: 0;
    line-height: 1.5rem;
    margin-right: 0.5rem;
  }

  & .snackbar-description {
    margin: 0;
    line-height: 1.5rem;
    font-weight: 300;
    color: ${grey[800]};
  }
  `
);

const positioningStyles = {
  entering: "translateX(0)",
  entered: "translateX(0)",
  exiting: "translateX(110%)",
  exited: "translateX(110%)",
  unmounted: "translateX(110%)",
};
