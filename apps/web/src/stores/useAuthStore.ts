// src/stores/useAuthStore.ts
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

// Vẫn cần lưu cái này vì API bước 2 bắt buộc gửi lại Password
interface TempCredentials {
  email?: string;
  username?: string;
  password: string;
  role: "OWNER" | "EMPLOYEE" | "ADMIN";
}

interface AuthState {
  user: User | null;
  accessToken: string | null; // Dùng chung cho cả System Token và Store Token
  currentStore: Store | null;
  isAuthenticated: boolean;
  tempCredentials: TempCredentials | null;

  // Action Login bước 1
  setSystemToken: (
    token: string,
    tempCreds: TempCredentials,
    user?: User,
  ) => void;

  // Action Login bước 2 (Update token mới)
  setStoreToken: (newToken: string, store: Store, user: User) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      currentStore: null,
      isAuthenticated: false,
      tempCredentials: null,

      // Bước 1: Lưu token hệ thống
      setSystemToken: (token, tempCredentials, user) =>
        set({
          accessToken: token, // Lưu vào accessToken
          tempCredentials,
          user, // Owner có user ngay, Employee thì null
          isAuthenticated: false, // Chưa coi là auth hoàn toàn cho đến khi chọn store
        }),

      // Bước 2: Cập nhật token cửa hàng (Ghi đè token cũ)
      setStoreToken: (newToken, store, user) =>
        set({
          accessToken: newToken, // Ghi đè bằng token mới xịn hơn
          currentStore: store,
          user,
          isAuthenticated: true,
          tempCredentials: null, // Xóa pass tạm
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          currentStore: null,
          isAuthenticated: false,
          tempCredentials: null,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        currentStore: state.currentStore,
        isAuthenticated: state.isAuthenticated,
        tempCredentials: state.tempCredentials, // Cần persist để reload trang Select Store không mất pass
      }),
    },
  ),
);
