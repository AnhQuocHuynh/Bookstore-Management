import React from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
    { name: "NV A", value: 92 },
    { name: "NV B", value: 81 },
    { name: "NV C", value: 73 },
    { name: "NV D", value: 85 },
    { name: "NV E", value: 75 },
    { name: "NV F", value: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
                <p className="font-bold text-cyan-950">{label}</p>
                <p className="text-teal-600">{`Giao dịch: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

export const EmployeeTransactionComparison = () => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex-1">
            <h2 className="text-neutral-800 text-xl font-bold mb-6">
                So sánh số lượng giao dịch
            </h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#102E3C' }}
                            dy={10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill="#0d9488" // teal-600
                                    className="hover:fill-cyan-900 transition-all duration-300 cursor-pointer"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};