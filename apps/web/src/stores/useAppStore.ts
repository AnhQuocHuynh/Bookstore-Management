import { create } from "zustand";

interface AppState {
  // Global app state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Add more global app state as needed
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

