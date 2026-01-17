import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { reportApi } from "../api/report.api";
import { EmployeeReportParams, RevenueReportParams, StockReportParams } from "../types";

export const useRevenueReport = (params: RevenueReportParams) => {
    // Clean params: Loại bỏ undefined/null
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );

    return useQuery({
        queryKey: ["revenue-report", cleanParams],
        queryFn: () => reportApi.getRevenueDashboard(cleanParams),
        staleTime: 1000 * 60 * 5, // Cache 5 phút vì báo cáo không thay đổi quá nhanh
    });
};

export const useStockReport = (params: StockReportParams) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );

    return useQuery({
        queryKey: ["stock-report", cleanParams],
        queryFn: () => reportApi.getStockDashboard(cleanParams),

        // --- FIX LỖI 1 TẠI ĐÂY (React Query v5) ---
        // Thay vì keepPreviousData: true
        placeholderData: keepPreviousData,

        staleTime: 1000 * 60 * 2,
    });
};

export const useEmployeeReport = (params: EmployeeReportParams) => {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );

    return useQuery({
        queryKey: ["employee-report", cleanParams],
        queryFn: () => reportApi.getEmployeeDashboard(cleanParams),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5,
    });
};

export const useReportCategories = () => {
    return useQuery({
        queryKey: ["report-categories-filter"], // Key riêng để tránh conflict cache
        queryFn: () => reportApi.getCategories(),
        staleTime: 1000 * 60 * 15, // Cache 15 phút vì danh mục ít thay đổi
        select: (data: any) => data.data || [], // Transform data ngay tại đây nếu response trả về dạng { data: [...] }
    });
};