import React from "react";

export const RevenueDonutChart = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-neutral-800 text-xl font-bold">Doanh số theo Hàng hóa</h2>
                <div className="px-4 py-2 border-2 border-teal-600 rounded-full text-cyan-950 font-bold text-sm">
                    23/12/2025
                </div>
            </div>

            <div className="flex items-center">
                {/* Biểu đồ SVG */}
                <div className="relative w-64 h-64 flex items-center justify-center mr-8 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-teal-500" strokeWidth="4" strokeDasharray="33, 100"></circle>
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray="16, 100" strokeDashoffset="-33"></circle>
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-pink-500" strokeWidth="4" strokeDasharray="20, 100" strokeDashoffset="-49"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-neutral-500 text-sm">Total Value</span>
                        <span className="text-neutral-950 text-3xl font-bold">3,6Tr</span>
                    </div>
                </div>

                {/* Chú thích (Legend) */}
                <div className="flex-1 space-y-2 text-sm">
                    <div className="flex justify-between items-center p-1 border-b">
                        <span className="text-neutral-500">Label</span>
                        <span className="text-neutral-500 w-16 text-right">Value</span>
                        <span className="text-neutral-500 w-12 text-right">%</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-teal-500"></div><span>Tập 100 trang</span>
                        </div>
                        <span className="font-medium">1.2Tr</span><span className="font-medium text-right">33.3%</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Tập 200 trang</span>
                        </div>
                        <span className="font-medium">604K</span><span className="font-medium text-right">16.7%</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500"></div><span>Giáo trình</span>
                        </div>
                        <span className="font-medium">733K</span><span className="font-medium text-right">20.2%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};