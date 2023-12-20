import { ReactNode } from "react";
import { create } from "zustand";

interface UIStoreType {
  snackbarContent: SnackMessageType;
  setSnackbarContent: (content: Omit<SnackMessageType, "open">) => void;
  closeSnackBar: () => void;
}

export const useUIStore = create<UIStoreType>((set) => ({
  snackbarContent: {
    title: "",
    message: "",
    type: "success",
    open: false,
  },
  setSnackbarContent: (content) =>
    set({ snackbarContent: { ...content, open: true } }),
  closeSnackBar: () =>
    set(({ snackbarContent }) => ({
      snackbarContent: {
        ...snackbarContent,
        open: false,
      },
    })),
}));

export type SnackMessageType = {
  title: string;
  message?: string;
  messageNode?: ReactNode;
  type: "success" | "error";
  open: boolean;
};
