import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartResponse } from "../types/dashboard";
import { Spin } from "antd";
import { formatCurrency } from "@/utils";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear"; // Import plugin tuần

// Kích hoạt plugin
dayjs.extend(weekOfYear);

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
              tickFormatter={(val) => {
                if (period === 'month') return dayjs(val).format('MM/YY');
                // Sửa lỗi .week() tại đây
                if (period === 'week') return `W${dayjs(val).week()}`;
                return dayjs(val).format('DD/MM');
              }}
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
              labelFormatter={(label) => dayjs(label).format(period === 'month' ? 'MM/YYYY' : 'DD/MM/YYYY')}
            />
            <Legend verticalAlign="top" height={36} />

            <Line type="monotone" dataKey="Doanh thu" stroke="#1A998F" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Lợi nhuận" stroke="#e73108" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueSummary;