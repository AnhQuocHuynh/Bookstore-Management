import React from "react";

export const RevenueStatCards = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Lợi nhuận */}
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-cyan-900 font-medium">Lợi nhuận</span>
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                        💰
                    </div>
                </div>
                <div className="text-cyan-950 text-2xl font-bold mb-2">3,625,000 VND</div>
                <div className="text-green-700 text-sm font-medium">+5.2% so với hôm trước</div>
            </div>

            {/* Card 2: Số Đơn Hàng */}
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-cyan-900 font-medium">Số Đơn Hàng</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-teal-600">
                        📦
                    </div>
                </div>
                <div className="text-cyan-950 text-2xl font-bold mb-2">73</div>
                <div className="text-green-700 text-sm font-medium">+3.7% so với hôm trước</div>
            </div>

            {/* Card 3: Số tiền nhập */}
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-4 text-gray-400">
                    <span className="font-medium">Số tiền nhập</span>
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">📉</div>
                </div>
                <div className="text-gray-400 text-2xl font-bold">-</div>
            </div>

            {/* Card 4: Sản phẩm bán ra */}
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-cyan-900 font-medium">Sản phẩm bán ra</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">✨</div>
                </div>
                <div className="text-cyan-950 text-2xl font-bold mb-2">213</div>
                <div className="text-green-700 text-sm font-medium">+1.2%</div>
            </div>
        </div>
    );
};