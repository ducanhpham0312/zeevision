import { Modal, ModalProps } from "@mui/base";
import React, { useEffect } from "react";
import { useModalStore } from "../../contexts/modalStore";
import { styled } from "@mui/system";

interface StyledPopUpModalProps extends ModalProps {
  open: boolean;
  onClose: () => void;
}

export const StyledPopUpModal: React.FC<StyledPopUpModalProps> = ({
  open,
  onClose,
  children,
  ...props
}) => {
  return (
    <StyledModal
      {...props}
      open={open}
      onClose={onClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      {children}
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
