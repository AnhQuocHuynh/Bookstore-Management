import React from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 6500 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 8000 },
    { name: "May", value: 5500 },
    { name: "Jun", value: 7000 },
];

export const RevenueBarChart = () => {
    return (
        <div className="bg-white rounded-lg p-6 mb-8 border border-zinc-100">
            <div className="mb-4">
                <div className="text-cyan-950 text-3xl font-bold">15,725,000 VND</div>
                <div className="text-gray-500 text-sm">Doanh thu theo tháng</div>
            </div>

            <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} dy={10} />
                        <Tooltip cursor={{ fill: "transparent" }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#14b8a6" /> // Màu teal-500
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};