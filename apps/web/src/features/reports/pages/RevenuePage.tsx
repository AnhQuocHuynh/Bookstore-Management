import React from "react";
import { RevenueHeader } from "../components/revenue/RevenueHeader";
import { RevenueDonutChart } from "../components/revenue/RevenueDonutChart";
import { RevenueStatCards } from "../components/revenue/RevenueStatCards";
import { RevenueBarChart } from "../components/revenue/RevenueBarChart";
import { TopSellingProducts } from "../components/revenue/TopSellingProducts";

const RevenuePage = () => {
    return (
        <div className="p-8 font-['Inter']"> {/* Giữ class p-8 của body cũ nhưng gán vào div */}

            {/* Header */}
            <RevenueHeader />

            <div className="grid grid-cols-12 gap-8">

                {/* CỘT TRÁI (Biểu đồ tròn + Thẻ thống kê) */}
                <div className="col-span-6 space-y-8">
                    <RevenueDonutChart />
                    <RevenueStatCards />
                </div>

                {/* CỘT PHẢI (Biểu đồ cột + List sản phẩm) */}
                <div className="col-span-6">
                    <div className="bg-teal-600/10 rounded-[20px] p-6 h-full border border-teal-200">
                        {/* Filter */}
                        <div className="flex gap-4 mb-6">
                            <select className="bg-white border-2 border-teal-600 rounded-full px-4 py-1 text-sm font-bold text-cyan-950 outline-none">
                                <option>Tất cả Sản phẩm</option>
                            </select>
                            <select className="bg-white border-2 border-teal-600 rounded-full px-4 py-1 text-sm font-bold text-cyan-950 outline-none">
                                <option>7 Ngày Trước</option>
                            </select>
                        </div>

                        <RevenueBarChart />
                        <TopSellingProducts />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RevenuePage;