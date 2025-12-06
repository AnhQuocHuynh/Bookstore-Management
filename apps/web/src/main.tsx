import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { antdTheme } from "./config/antd-theme";
import { queryClient } from "./lib/react-query";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>
);
