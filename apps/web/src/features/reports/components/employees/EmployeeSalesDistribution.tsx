import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: "Nhân viên A", value: 19, color: "#fdba74" }, // orange-300
    { name: "Nhân viên B", value: 17, color: "#fb923c" }, // orange-400
    { name: "Nhân viên C", value: 15, color: "#fde047" }, // yellow-300
    { name: "Nhân viên D", value: 16, color: "#4ade80" }, // green-400
    { name: "Nhân viên E", value: 18, color: "#60a5fa" }, // blue-400
    { name: "Nhân viên F", value: 15, color: "#c084fc" }, // purple-400
];

export const EmployeeSalesDistribution = () => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-100 mb-8">
            <h2 className="text-neutral-800 text-xl font-bold mb-8">
                Phần trăm doanh số
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-around gap-12">
                {/* Chart */}
                <div className="relative w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                cornerRadius={10}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text (Optional) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-cyan-950">100%</span>
                    </div>
                </div>

                {/* Custom Legend */}
                <div className="flex-1 w-full space-y-3">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className={`flex justify-between items-center p-2 rounded-lg ${index === 0 ? 'bg-orange-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-bold text-cyan-950">{item.value}%</span>
                        </div>
                    ))}

                    <div className="flex justify-between items-center p-2 border-t pt-4 mt-2">
                        <div className="text-neutral-500 text-sm">Tổng số nhân viên: 6</div>
                        <div className="font-bold text-teal-600">729 Giao dịch</div>
                    </div>
                </div>
            </div>
        </div>
    );
};