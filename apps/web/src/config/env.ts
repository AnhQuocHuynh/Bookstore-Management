export const env = {
  API_URL: import.meta.env.VITE_API_URL || "/api",
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
