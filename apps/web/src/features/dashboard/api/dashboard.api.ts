// file: api/dashboard.api.ts
import { apiClient } from "@/lib/axios"; // Giả định bạn đã có axios client
import { ChartResponse, DashboardOverview, DashboardParams } from "../types/dashboard";

export const dashboardApi = {
    // GET /api/v1/reports/overview
    getOverview: async (params?: DashboardParams) => {
        const response = await apiClient.get<DashboardOverview>("/reports/overview", { params });
        return response.data;
    },

    // GET /api/v1/reports/chart-financial-metrics
    getFinancialChart: async (params?: DashboardParams) => {
        const response = await apiClient.get<ChartResponse>("/reports/chart-financial-metrics", { params });
        return response.data;
    },

    // GET /api/v1/reports/chart-product-metrics
    getProductChart: async (params?: DashboardParams) => {
        const response = await apiClient.get<ChartResponse>("/reports/chart-product-metrics", { params });
        return response.data;
    },
};