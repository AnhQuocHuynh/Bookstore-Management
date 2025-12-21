import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface TempCredentials {
  email?: string;
  username?: string;
  password: string;
  role: "OWNER" | "EMPLOYEE";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  currentStore: Store | null;
  isAuthenticated: boolean;
  systemToken: string | null; // Token tạm từ system login
  tempCredentials: TempCredentials | null; // Credentials tạm (memory only)
  login: (user: User, systemToken: string, tempCreds: TempCredentials) => void;
  setStore: (store: Store) => void;
  setAccessToken: (accessToken: string) => void;
  clearTemp: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      currentStore: null,
      isAuthenticated: false,
      systemToken: null,
      tempCredentials: null,

      login: (user, systemToken, tempCreds) => set({
        user,
        systemToken,
        tempCredentials,
        isAuthenticated: true,
      }),

      setStore: (store) => set({ currentStore: store }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearTemp: () => set({ systemToken: null, tempCredentials: null }),

      logout: () => set({
        user: null,
        accessToken: null,
        currentStore: null,
        systemToken: null,
        tempCredentials: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ // Không persist temp
        user: state.user,
        accessToken: state.accessToken,
        currentStore: state.currentStore,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);