import { create } from "zustand";

interface UIStoreType {
  count: number;
  increaseCount: () => void;
}

export const useUIStore = create<UIStoreType>((set) => ({
  count: 0,
  increaseCount: () => set(({ count }) => ({ count: count + 1 })),
}));
