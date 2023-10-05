import { create } from "zustand";

interface ModalStoreStyle {
  isModalOpen: boolean;
  closeModal: () => void;
  openModal: () => void;
}

export const useModalStore = create<ModalStoreStyle>((set) => ({
  isModalOpen: false,
  closeModal: () => {
    console.log("Closing Modal");
    set({ isModalOpen: false });
  },
  openModal: () => {
    console.log("Opening modal...");
    set({ isModalOpen: true });
  },
}));
