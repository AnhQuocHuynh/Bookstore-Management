// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy tất cả request bắt đầu bằng /api/v1 → backend
      "/api/v1": {
        target: "http://localhost:3001", // port backend
        changeOrigin: true,
        secure: false,
        // Không cần rewrite vì backend endpoint có /api/v1
        // Nếu backend endpoint KHÔNG có /api/v1 (chỉ /auth/sign-in), thì thêm:
        // rewrite: (path) => path.replace(/^\/api\/v1/, ''),
      },
    },
  },
});