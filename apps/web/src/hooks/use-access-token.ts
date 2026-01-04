import { useState, useEffect } from "react";

/**
 * Hook lấy access token từ localStorage
 * @param key Key trong localStorage, mặc định là "accessToken"
 */
export const useAccessToken = (key: string = "accessToken") => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setToken(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);

  const updateToken = (newToken: string | null) => {
    if (newToken === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, newToken);
    }
    setToken(newToken);
  };

  return { token, updateToken };
};
