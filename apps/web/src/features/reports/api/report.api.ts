import { apiClient } from "@/lib/axios";
import { RevenueReportResponse, RevenueReportParams, StockReportParams, StockReportResponse, EmployeeReportResponse, EmployeeReportParams, } from "../types";
import qs from "qs";
import { ReportCategory } from "../types";

export const reportApi = {
    // --- 1. SỬA: Revenue Dashboard ---
    getRevenueDashboard: async (params?: RevenueReportParams) => {
        const response = await apiClient.get<RevenueReportResponse>("/reports/revenue/dashboard", {
            params,
            // THÊM: serialize mảng thành dạng lặp lại (repeat) để tránh lỗi 400
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
        });
        return response.data;
    },

    // --- 2. SỬA: Stock Dashboard ---
    getStockDashboard: async (params?: StockReportParams) => {
        const response = await apiClient.get<StockReportResponse>("/reports/stock/dashboard", {
            params,
            // SỬA: Đổi từ 'brackets' sang 'repeat'
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
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

    getCategories: async () => {
        // Chỉ cần lấy tên và id để filter, limit 100 để lấy hết các danh mục chính
        const response = await apiClient.get<{ data: ReportCategory[] }>("/categories?status=active&limit=100");
        return response.data;
    }
};