import { Button } from "@mui/base";
import { styled } from "@mui/system";
import { PRIMARY } from "../theme/palette";

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * How large should the button be?
   */
  size?: "small" | "standard" | "large";
  /**
   * Button contents
   */
  label?: string;

  children?: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

export const StyledButton = ({
  // primary = false,
  // size = "standard",
  label,
  children,
  ...props
}: ButtonProps) => {
  return (
    <StyledButtonComponent type="button" {...props}>
      {label || children}
    </StyledButtonComponent>
  );
};

const StyledButtonComponent = styled(Button)(
  () => `
  all: unset;
  font-weight: 600;
  font-size: 0.875rem;
  background-color: ${PRIMARY[500]};
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  border: none;

  &:hover {
    background-color: ${PRIMARY[600]};
  }
`
);
