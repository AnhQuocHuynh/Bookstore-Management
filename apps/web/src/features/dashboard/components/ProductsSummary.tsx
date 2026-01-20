import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartResponse } from "../types/dashboard";
import { Spin } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

interface ProductSummaryProps {
  data?: ChartResponse;
  isLoading: boolean;
  totalItems?: number;
  period?: 'day' | 'week' | 'month';
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ data, isLoading, totalItems, period = 'day' }) => {
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

  const formatDateLabel = (val: string) => {
    if (!val) return "";
    const dateObj = dayjs(val);
    if (!dateObj.isValid()) return val;

    if (period === 'month') return dateObj.format('MM/YY');
    if (period === 'week') return `W${dateObj.week()}`;
    return dateObj.format('DD/MM');
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center bg-white rounded-xl"><Spin /></div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all h-full border border-gray-100">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-lg font-semibold text-[#102E3C]">{totalItems ?? 0}</h2>
        <p className="text-sm text-gray-500">Sản phẩm bán được</p>
      </div>

      <div className="w-full h-[calc(100%-80px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              dy={10}
              tickFormatter={formatDateLabel}
            />
            <YAxis
              width={40}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelFormatter={formatDateLabel}
            />
            <Legend verticalAlign="top" height={36} />

            {/* FIX: Sắp xếp lại đúng thứ tự hiển thị trong Legend */}
            {/* 1. Sách (Màu Xanh) */}
            <Line
              type="monotone"
              dataKey="Sách"
              stroke="#1A998F"
              strokeWidth={2}
              dot={{ r: 3, fill: "#1A998F", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />

            {/* 2. Văn phòng phẩm (Màu Đỏ/Cam đậm) */}
            <Line
              type="monotone"
              dataKey="Văn phòng phẩm"
              stroke="#e73108"
              strokeWidth={2}
              dot={{ r: 3, fill: "#e73108", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />

            {/* 3. Sản phẩm khác (Màu Vàng) */}
            <Line
              type="monotone"
              dataKey="Sản phẩm khác"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductSummary;