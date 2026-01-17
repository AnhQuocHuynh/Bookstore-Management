// file: pages/DashboardPage.tsx
import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { Greeting } from "@/features/dashboard/components/Greeting";
import ProductSummary from "@/features/dashboard/components/ProductsSummary";
import RevenueSummary from "@/features/dashboard/components/RevenueSummary";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardOverview, useFinancialChart, useProductChart } from "@/features/dashboard/hooks/useDashboard";
import { formatCurrency } from "@/utils";
import { Skeleton } from "antd"; // Dùng Skeleton khi loading

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // 1. Quản lý State thời gian (Mặc định là ngày hiện tại)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 2. Tính toán params: Backend cần from/to. 
  // Logic: Chọn 1 ngày -> Lấy dữ liệu từ đầu tháng đó đến cuối tháng đó.
  const queryParams = useMemo(() => {
    const startOfMonth = dayjs(selectedDate).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs(selectedDate).endOf('month').format('YYYY-MM-DD');
    return {
      from: startOfMonth,
      to: endOfMonth,
      period: 'day' as const // Chart xem theo ngày trong tháng
    };
  }, [selectedDate]);

  // 3. Fetch Data
  const { data: overviewData, isLoading: loadOverview } = useDashboardOverview(queryParams);
  const { data: finChartData, isLoading: loadFinChart } = useFinancialChart(queryParams);
  const { data: prodChartData, isLoading: loadProdChart } = useProductChart(queryParams);

  // Helper render thẻ KPI
  const renderKpiCard = (title: string, value: number, growth: number, icon: string, colorClass: string, isCurrency = true) => (
    <div className={`flex flex-col gap-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[${colorClass}]`}>
      <div className="flex items-center justify-between">
        <p className="text-sm sm:text-base font-medium text-[#155665]">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-opacity-20 text-${colorClass === '#1A998F' ? 'teal-600' : 'orange-500'} bg-gray-100`}>
          {/* Bạn có thể thay bằng icon Lucide hoặc Material Symbol như cũ */}
          <span className="material-symbols-outlined text-[24px] text-[#155665]">{icon}</span>
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-[#102E3C]">
        {isCurrency ? formatCurrency(value) : value}
      </p>
      <p className={`text-sm sm:text-base font-medium ${growth >= 0 ? 'text-[#078830]' : 'text-red-500'}`}>
        {growth > 0 ? '+' : ''}{growth.toFixed(1)}% so với kỳ trước
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      {/* 1. Header & Greeting */}
      {user && <Greeting user={user} />}

      {/* Truyền state xuống Header để điều khiển lịch */}
      <DashboardHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* 2. KPI Cards */}
      {loadOverview ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton.Button key={i} active style={{ height: 120, width: '100%' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mb-8 mb-4">
          {renderKpiCard("Lợi nhuận", overviewData?.overview.profit.value || 0, overviewData?.overview.profit.growth_percent || 0, "attach_money", "#1A998F")}
          {renderKpiCard("Doanh thu", overviewData?.overview.revenue.value || 0, overviewData?.overview.revenue.growth_percent || 0, "payments", "#1A998F")}
          {renderKpiCard("Tiền nhập hàng", overviewData?.overview.purchase_cost.value || 0, overviewData?.overview.purchase_cost.growth_percent || 0, "inventory_2", "#f59e0b")}
          {/* Service Fee có thể ẩn nếu = 0 hoặc hiển thị tùy ý */}
          {renderKpiCard("Phí dịch vụ", overviewData?.overview.service_fee.value || 0, overviewData?.overview.service_fee.growth_percent || 0, "receipt_long", "#e73108")}
        </div>
      )}

      {/* 3. Charts Area */}
      <div className="flex flex-col gap-6 lg:flex-row h-[500px]">
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#102E3C]">
            Biểu đồ Tài chính
          </h1>
          <RevenueSummary
            data={finChartData}
            isLoading={loadFinChart}
            totalRevenue={overviewData?.overview.revenue.value}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#102E3C]">
            Biểu đồ Sản phẩm
          </h1>
          <ProductSummary
            data={prodChartData}
            isLoading={loadProdChart}
            totalItems={prodChartData?.datasets?.[0]?.values?.reduce((a, b) => a + b, 0)}
          />
        </div>
      </div>
    </div>
  );
};