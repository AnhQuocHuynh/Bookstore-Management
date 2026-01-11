import React from "react";

export const RevenueHeader = () => {
    return (
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-cyan-950 text-4xl font-bold leading-9">Thống kê về Doanh thu</h1>
            </div>
            <div className="text-cyan-950 text-lg opacity-70">
                Thời gian đồng bộ gần nhất: 23/12/2025 08:32:00 A.M
            </div>
        </div>
    );
};