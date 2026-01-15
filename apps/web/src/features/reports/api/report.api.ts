import { apiClient } from "@/lib/axios";
import { RevenueReportResponse, RevenueReportParams } from "../types";

export const reportApi = {
    getRevenueDashboard: async (params?: RevenueReportParams) => {
        // API GET /api/v1/reports/revenue/dashboard
        const response = await apiClient.get<RevenueReportResponse>("/reports/revenue/dashboard", {
            params
        });
        return response.data;
    },
};