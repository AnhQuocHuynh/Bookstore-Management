import { useQuery } from "@tanstack/react-query";
import { reportApi } from "../api/report.api";
import { RevenueReportParams } from "../types";

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