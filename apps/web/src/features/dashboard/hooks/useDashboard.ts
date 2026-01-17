import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { DashboardParams } from "../types/dashboard";

// Loại bỏ các giá trị undefined/null/rỗng trước khi gửi
const cleanParams = (params: DashboardParams) => {
    return Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
    );
};

export const useDashboardOverview = (params: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard-overview", cleanParams(params)],
        queryFn: () => dashboardApi.getOverview(cleanParams(params)),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
};

export const useFinancialChart = (params: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard-financial-chart", cleanParams(params)],
        queryFn: () => dashboardApi.getFinancialChart(cleanParams(params)),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
};

export const useProductChart = (params: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard-product-chart", cleanParams(params)],
        queryFn: () => dashboardApi.getProductChart(cleanParams(params)),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
};