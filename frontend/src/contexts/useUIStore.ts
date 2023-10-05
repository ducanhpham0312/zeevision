import { create } from "zustand";

interface UIStoreType {
  snackMessage: SnackMessageType;
  setSnackMessage: (content: Omit<SnackMessageType, "open">) => void;
  closeSnackMessage: () => void;
}

export const useUIStore = create<UIStoreType>((set) => ({
  snackMessage: {
    title: "",
    message: "",
    type: "success",
    open: false,
  },
  setSnackMessage: (content) =>
    set({ snackMessage: { ...content, open: true } }),
  closeSnackMessage: () =>
    set(({ snackMessage }) => ({
      snackMessage: {
        ...snackMessage,
        open: false,
      },
    })),
}));

type SnackMessageType = {
  title: string;
  message: string;
  type: "success" | "error";
  open: boolean;
};
