import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // Add other user fields as needed
}

export interface Store {
  id: string;
  name: string;
  address?: string;
  // Add other store fields as needed
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentStore: Store | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setCurrentStore: (store: Store) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentStore: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      setCurrentStore: (store) => {
        set({ currentStore: store });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          currentStore: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);

