import { create } from "zustand";

const DEFAULT_LIMIT = 15;
interface TableStoreType {
  loading: boolean;
  setLoading: (state: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  resetPagination: () => void;
}

export const useTableStore = create<TableStoreType>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  page: 0,
  setPage: (page: number) => set({ page }),
  limit: DEFAULT_LIMIT,
  setLimit: (limit: number) => set({ limit }),
  resetPagination: () => set({ page: 0, limit: DEFAULT_LIMIT }),
}));
