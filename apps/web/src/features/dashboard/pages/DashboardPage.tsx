import React, { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker, Select, Segmented, Skeleton, Button } from "antd"; // Sử dụng Antd components cho đồng bộ
import { Filter, RotateCcw } from "lucide-react";

import { Greeting } from "@/features/dashboard/components/Greeting";
import ProductSummary from "@/features/dashboard/components/ProductsSummary";
import RevenueSummary from "@/features/dashboard/components/RevenueSummary";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardOverview, useFinancialChart, useProductChart } from "@/features/dashboard/hooks/useDashboard";
import { formatCurrency } from "@/utils";

const { RangePicker } = DatePicker;

// Định nghĩa kiểu RangeValue cho DatePicker
type RangeValue = [Dayjs | null, Dayjs | null] | null;

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // --- 1. STATES QUẢN LÝ BỘ LỌC ---
  // Mặc định lấy dữ liệu tháng hiện tại
  const [dateRange, setDateRange] = useState<RangeValue>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);

  const [productType, setProductType] = useState<string | undefined>(undefined); // Lọc KPI theo loại
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day'); // Nhóm biểu đồ theo

  // --- 2. CHUẨN BÓNG DỮ LIỆU GỬI API ---
  const queryParams = useMemo(() => {
    return {
      from: dateRange?.[0]?.format('YYYY-MM-DD'), // Tham số 'from' 
      to: dateRange?.[1]?.format('YYYY-MM-DD'),   // Tham số 'to' 
    };
  }, [dateRange]);

  // --- 3. GỌI HOOKS (API) ---

  // API Overview: Lấy KPI (Doanh thu, Lợi nhuận...)
  // Truyền thêm productType để lọc theo Sách/VPP 
  const { data: overviewData, isLoading: loadOverview } = useDashboardOverview({
    ...queryParams,
    productType: productType
  });

  // API Financial Chart: Biểu đồ tài chính
  // Truyền thêm period để nhóm theo ngày/tuần/tháng 
  const { data: finChartData, isLoading: loadFinChart } = useFinancialChart({
    ...queryParams,
    period: period
  });

  // API Product Chart: Biểu đồ sản lượng
  // Truyền thêm period [cite: 1]
  const { data: prodChartData, isLoading: loadProdChart } = useProductChart({
    ...queryParams,
    period: period
  });

  // --- 4. CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleResetFilter = () => {
    setDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
    setProductType(undefined);
    setPeriod('day');
  };

  // Helper render Card KPI
  const renderKpiCard = (title: string, value: number, growth: number, icon: string, colorClass: string, isCurrency = true) => (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm sm:text-base font-medium text-[#155665]">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-opacity-20 bg-gray-100 text-${colorClass === '#1A998F' ? 'teal-600' : 'orange-500'}`}>
          <span className="material-symbols-outlined text-[24px]" style={{ color: colorClass }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-[#102E3C]">
        {isCurrency ? formatCurrency(value) : value}
      </p>
      <div className="flex items-center gap-1">
        {growth !== 0 && (
          <span className={`material-symbols-outlined text-sm ${growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {growth > 0 ? 'trending_up' : 'trending_down'}
          </span>
        )}
        <p className={`text-sm sm:text-base font-medium ${growth >= 0 ? 'text-[#078830]' : 'text-red-500'}`}>
          {/* Logic API: Tự tính kỳ trước để so sánh [cite: 4] */}
          {Math.abs(growth).toFixed(1)}% <span className="text-gray-400 font-normal text-xs">so với kỳ trước</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-[#f8fafc] min-h-screen font-['Inter']">

      {/* --- HEADER & BỘ LỌC CHÍNH --- */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          {user && <Greeting user={user} />}
          <Button icon={<RotateCcw size={14} />} onClick={handleResetFilter} type="text" className="text-gray-500">
            Đặt lại bộ lọc
          </Button>
        </div>

        {/* Thanh công cụ lọc: Cho phép chọn Khoảng ngày & Loại sản phẩm */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[#102E3C] font-bold text-lg hidden md:block">Tổng quan kinh doanh</span>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            {/* Lọc loại sản phẩm cho API Overview */}
            <Select
              placeholder="Loại sản phẩm"
              style={{ width: 160 }}
              value={productType}
              onChange={setProductType}
              allowClear
              options={[
                { label: 'Tất cả', value: undefined },
                { label: 'Sách', value: 'book' },
                { label: 'Văn phòng phẩm', value: 'stationery' },
              ]}
            />

            {/* Lọc khoảng thời gian (From - To) */}
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as RangeValue)}
              format="DD/MM/YYYY"
              allowClear={false}
              className="w-full md:w-[260px]"
            />
          </div>
        </div>
      </div>

      {/* --- KPI CARDS SECTION --- */}
      {/* Hiển thị số liệu tổng quan dựa trên tham số queryParams + productType */}
      {loadOverview ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton.Button key={i} active style={{ height: 140, width: '100%', borderRadius: 12 }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {renderKpiCard("Lợi nhuận", overviewData?.overview.profit.value || 0, overviewData?.overview.profit.growth_percent || 0, "attach_money", "#1A998F")}

          {renderKpiCard("Doanh thu", overviewData?.overview.revenue.value || 0, overviewData?.overview.revenue.growth_percent || 0, "payments", "#1A998F")}

          {/* purchase_cost ở đây là Giá vốn hàng bán (Subtotal) [cite: 7] */}
          {renderKpiCard("Doanh số (Chưa thuế)", overviewData?.overview.purchase_cost.value || 0, overviewData?.overview.purchase_cost.growth_percent || 0, "inventory_2", "#f59e0b")}

          {renderKpiCard("Phí dịch vụ", overviewData?.overview.service_fee.value || 0, overviewData?.overview.service_fee.growth_percent || 0, "receipt_long", "#e73108")}
        </div>
      )}

      {/* --- CHARTS SECTION --- */}
      <div className="flex flex-col gap-4">
        {/* Chart Controls: Chỉ chỉnh Period cho biểu đồ */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-teal-600" />
            <h2 className="text-sm md:text-base font-bold text-[#102E3C]">Phân tích biểu đồ theo:</h2>
          </div>
          {/* Chọn Period (day/week/month)  */}
          <Segmented
            options={[
              { label: 'Ngày', value: 'day' },
              { label: 'Tuần', value: 'week' },
              { label: 'Tháng', value: 'month' },
            ]}
            value={period}
            onChange={(val) => setPeriod(val as any)}
            className="font-medium"
          />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row h-[500px]">
          {/* Financial Chart */}
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <h3 className="font-bold text-gray-700 ml-1">Biểu đồ Tài chính</h3>
            <RevenueSummary
              data={finChartData}
              isLoading={loadFinChart}
              totalRevenue={overviewData?.overview.revenue.value}
              period={period} // Truyền period để format ngày tháng trên trục X
            />
          </div>

          {/* Product Chart */}
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <h3 className="font-bold text-gray-700 ml-1">Biểu đồ Sản lượng</h3>
            <ProductSummary
              data={prodChartData}
              isLoading={loadProdChart}
              totalItems={prodChartData?.datasets?.[0]?.values?.reduce((a, b) => a + b, 0)}
              period={period}
            />
          </div>
        </div>
      </div>
    </div>
  );
};