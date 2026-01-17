import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartResponse } from "../types/dashboard";
import { Spin } from "antd";
import { formatCurrency } from "@/utils";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Import thêm để parse string

dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

interface RevenueSummaryProps {
  data?: ChartResponse;
  isLoading: boolean;
  totalRevenue?: number;
  period?: 'day' | 'week' | 'month';
}

const RevenueSummary: React.FC<RevenueSummaryProps> = ({ data, isLoading, totalRevenue, period = 'day' }) => {
  const chartData = useMemo(() => {
    if (!data?.labels) return [];
    return data.labels.map((label, index) => {
      const item: any = { date: label };
      data.datasets.forEach((ds) => {
        item[ds.name] = ds.values[index] || 0;
      });
      return item;
    });
  }, [data]);

  // Hàm xử lý hiển thị ngày an toàn
  const formatDateLabel = (val: string) => {
    if (!val) return "";
    const dateObj = dayjs(val);
    if (!dateObj.isValid()) return val; // Nếu không parse được thì hiện nguyên gốc

    if (period === 'month') return dateObj.format('MM/YY');
    if (period === 'week') return `W${dateObj.week()}`;
    return dateObj.format('DD/MM');
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center bg-white rounded-xl"><Spin /></div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all h-full border border-gray-100">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-lg font-semibold text-[#102E3C]">
          {totalRevenue !== undefined ? formatCurrency(totalRevenue) : "..."}
        </h2>
        <p className="text-sm text-gray-500">Tổng doanh thu kỳ này</p>
      </div>

      <div className="w-full h-[calc(100%-80px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dy={10}
              tickFormatter={formatDateLabel} // Dùng hàm format an toàn
            />
            <YAxis
              width={80}
              tickFormatter={(val) => {
                if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                return val;
              }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={formatDateLabel}
            />
            <Legend verticalAlign="top" height={36} />

            {/* FIX: Để dot={{ r: 4 }} để hiện chấm tròn kể cả khi chỉ có 1 điểm dữ liệu */}
            <Line
              type="monotone"
              dataKey="Doanh thu"
              stroke="#1A998F"
              strokeWidth={3}
              dot={{ r: 4, fill: "#1A998F", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="Lợi nhuận"
              stroke="#e73108"
              strokeWidth={3}
              dot={{ r: 4, fill: "#e73108", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueSummary;