import { create } from "zustand";

interface UIStoreType {
  count: number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  increaseCount: () => void;
}

export const useUIStore = create<UIStoreType>((set) => ({
  count: 0,
  isSidebarOpen: false,
  toggleSidebar: () =>
    set(({ isSidebarOpen }) => ({ isSidebarOpen: !isSidebarOpen })),
  closeSidebar: () => set(() => ({ isSidebarOpen: false })),
  increaseCount: () => set(({ count }) => ({ count: count + 1 })),
}));
