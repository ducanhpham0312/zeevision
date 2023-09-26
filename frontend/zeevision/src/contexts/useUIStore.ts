import { create } from "zustand";

interface UIStoreType {
  count: number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  increaseCount: () => void;
}

export const useUIStore = create<UIStoreType>((set) => ({
  count: 0,
  isSidebarOpen: false,
  toggleSidebar: () =>
    set(({ isSidebarOpen }) => ({ isSidebarOpen: !isSidebarOpen })),
  increaseCount: () => set(({ count }) => ({ count: count + 1 })),
}));
