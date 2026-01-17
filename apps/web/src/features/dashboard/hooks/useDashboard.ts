// file: hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { DashboardParams } from "../types/dashboard";

export const useDashboardOverview = (params: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard-overview", params],
        queryFn: () => dashboardApi.getOverview(params),
        staleTime: 1000 * 60 * 5, // Cache 5 phút
    });
};

export const useFinancialChart = (params: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard-financial-chart", params],
        queryFn: () => dashboardApi.getFinancialChart(params),
        staleTime: 1000 * 60 * 5,
    });
};

export const useProductChart = (params: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard-product-chart", params],
        queryFn: () => dashboardApi.getProductChart(params),
        staleTime: 1000 * 60 * 5,
    });
};