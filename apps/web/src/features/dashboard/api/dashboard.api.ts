import { apiClient } from "@/lib/axios";
import { ChartResponse, DashboardOverview, DashboardParams } from "../types/dashboard";

export const dashboardApi = {
    // GET /api/v1/reports/overview
    // Hỗ trợ: from, to, productType
    getOverview: async (params?: DashboardParams) => {
        const response = await apiClient.get<DashboardOverview>("/reports/overview", { params });
        return response.data;
    },

    // GET /api/v1/reports/chart-financial-metrics
    // Hỗ trợ: from, to, period
    getFinancialChart: async (params?: DashboardParams) => {
        const response = await apiClient.get<ChartResponse>("/reports/chart-financial-metrics", { params });
        return response.data;
    },

    // GET /api/v1/reports/chart-product-metrics
    // Hỗ trợ: from, to, period
    getProductChart: async (params?: DashboardParams) => {
        const response = await apiClient.get<ChartResponse>("/reports/chart-product-metrics", { params });
        return response.data;
    },
};