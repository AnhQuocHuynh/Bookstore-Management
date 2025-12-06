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

interface AuthState {
  user: User | null;
  accessToken: string | null;
  currentStore: Store | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setStore: (store: Store) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      currentStore: null,
      isAuthenticated: false,
      
      login: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          accessToken: null,
          currentStore: null,
          isAuthenticated: false,
        });
      },
      
      setStore: (store) => {
        set({ currentStore: store });
      },
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
