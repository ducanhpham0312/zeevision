import { Button } from "@mui/base";
import { styled } from "@mui/system";
import { PRIMARY } from "../../theme/palette";

export type ButtonVariantType = "text" | "contained" | "outlined";

export type ButtonSizeType = "small" | "standard" | "large";

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  variant?: ButtonVariantType;
  /**
   * How large should the button be?
   */
  size?: ButtonSizeType;
  /**
   * Button contents
   */
  label?: string;

  children?: string;

  /**
   * toggleable button
   */
  active?: boolean;

  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export const StyledButton = ({
  variant = "outlined",
  size = "standard",
  label,
  children,
  ...props
}: ButtonProps) => {
  return (
    <StyledButtonComponent
      variant={variant}
      size={size}
      type="button"
      {...props}
    >
      {label || children}
    </StyledButtonComponent>
  );
};

const StyledButtonComponent = styled(Button, { shouldForwardProp: props => props !== "active"})(
  ({
    active,
    variant,
    size,
  }: {
    active?: boolean;
    size: ButtonSizeType;
    variant: ButtonVariantType;
  }) => `
  all: unset;
  position: relative;
  font-weight: 600;
  font-size: 1,125rem;
  background-color: ${variant === "contained" ? PRIMARY[900] : "white"};
  padding: ${
    size === "large" ? "18px 14px" : size === "small" ? "4px 12px" : "12px 14px"
  };
  border-radius: 4px;
  
  &::before {
    content: ""; /* Create an empty pseudo-element for the line indicator */
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 4px;
    height: ${active ? "4px" : "0"}; /* Set the height of the line based on 'active' */
    background-color: ${PRIMARY[900]}; /* Color of the line */
    transition: height 100ms ease; /* Transition only the height property */
  }

  outline: ${variant === "outlined" ? `2px solid ${PRIMARY[900]}` : "none"};
  color: ${variant === "contained" ? "white" : PRIMARY[900]};
  transition: all 150ms ease;
  cursor: pointer;

  &:hover {
    background-color: ${variant === "contained" ? PRIMARY[800] : PRIMARY[50]};
  }
`
);
