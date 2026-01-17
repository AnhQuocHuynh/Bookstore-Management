import { apiClient } from "@/lib/axios";
import { RevenueReportResponse, RevenueReportParams, StockReportParams, StockReportResponse, EmployeeReportResponse, EmployeeReportParams, } from "../types";
import qs from "qs";

export const reportApi = {
    getRevenueDashboard: async (params?: RevenueReportParams) => {
        // API GET /api/v1/reports/revenue/dashboard
        const response = await apiClient.get<RevenueReportResponse>("/reports/revenue/dashboard", {
            params
        });
        return response.data;
    },

    // API Stock Dashboard
    getStockDashboard: async (params?: StockReportParams) => {
        const response = await apiClient.get<StockReportResponse>("/reports/stock/dashboard", {
            params,
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' })
        });
        return response.data;
    },

    // API Employee Dashboard
    getEmployeeDashboard: async (params?: EmployeeReportParams) => {
        const response = await apiClient.get<EmployeeReportResponse>("/reports/employees/dashboard", {
            params,
            paramsSerializer: (params) => qs.stringify(params) // Không cần arrayFormat vì ko có mảng
        });
        return response.data;
    },
};