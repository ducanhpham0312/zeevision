import { create } from "zustand";

interface TableStoreType {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

export const useTableStore = create<TableStoreType>((set) => ({
  loading: false,
  setLoading: (state: boolean) => set({ loading: state }),
}));
