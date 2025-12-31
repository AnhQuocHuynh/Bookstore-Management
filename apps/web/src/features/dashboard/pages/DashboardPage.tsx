import { DashboardChartHeader } from "@/features/dashboard/components/DashboardChartHeader";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { Greeting } from "@/features/dashboard/components/Greeting";
import ProductSummary from "@/features/dashboard/components/ProductsSummary";
import RevenueSummary from "@/features/dashboard/components/RevenueSummary";
import { useAuthStore } from "@/stores/useAuthStore";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Tiêu đề tổng quan */}
      {user && <Greeting user={user || undefined} />}

      <DashboardHeader />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mb-8 mb-4">
        {/* Lợi nhuận */}
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base font-medium text-[#155665]">
              Lợi nhuận
            </p>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#1A998F]/20 text-[#1A998F]">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                attach_money
              </span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#102E3C]">
            $5,400
          </p>
          <p className="text-sm sm:text-base font-medium text-[#078830]">
            +4.5% so với hôm qua
          </p>
        </div>

        {/* Số tiền bán */}
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base font-medium text-[#155665]">
              Số tiền bán
            </p>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#1A998F]/20 text-[#1A998F]">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                payments
              </span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#102E3C]">
            $12,750
          </p>
          <p className="text-sm sm:text-base font-medium text-[#078830]">
            +3.2% so với hôm qua
          </p>
        </div>

        {/* Số tiền nhập */}
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base font-medium text-[#155665]">
              Số tiền nhập
            </p>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#f59e0b]/20 text-[#f59e0b]">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                inventory_2
              </span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#102E3C]">
            $7,300
          </p>
          <p className="text-sm sm:text-base font-medium text-[#f59e0b]">
            +2.8% so với hôm qua
          </p>
        </div>

        {/* Phí dịch vụ */}
        <div className="flex flex-col gap-2 rounded-xl bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-[#1A998F]">
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base font-medium text-[#155665]">
              Phí dịch vụ
            </p>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#e73108]/20 text-[#e73108]">
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">
                receipt_long
              </span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#102E3C]">$320</p>
          <p className="text-sm sm:text-base font-medium text-[#e73108]">
            +1.0% so với hôm qua
          </p>
        </div>
      </div>

      <DashboardChartHeader />

      {/* Charts + Product */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#102E3C]">
            Doanh thu tổng hợp
          </h1>
          <RevenueSummary />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#102E3C]">
            Sản phẩm
          </h1>
          <ProductSummary />
        </div>
      </div>
    </div>
  );
};
