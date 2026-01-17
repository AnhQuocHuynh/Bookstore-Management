// file: components/RevenueSummary.tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartResponse } from "../types/dashboard";
import { useMemo } from "react";
import { Spin } from "antd"; // Hoặc component Loading của bạn
import { formatCurrency } from "@/utils"; // Giả định có hàm này

interface RevenueSummaryProps {
  data?: ChartResponse;
  isLoading: boolean;
  totalRevenue?: number;
}

const RevenueSummary: React.FC<RevenueSummaryProps> = ({ data, isLoading, totalRevenue }) => {
  // Transform Data: API trả về { labels: [], datasets: [] } -> Recharts cần [{ name: 'Jan', 'Doanh thu': 100 }, ...]
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

  if (isLoading) return <div className="h-60 flex items-center justify-center"><Spin /></div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all h-full">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-lg font-semibold text-[#102E3C]">
          {totalRevenue ? formatCurrency(totalRevenue) : "..."}
        </h2>
        <p className="text-sm text-gray-500">Tổng doanh thu kỳ này</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(val) => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`} width={40} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            {/* Tự động render Line dựa trên dataset trả về */}
            <Line type="monotone" dataKey="Doanh thu" name="Doanh thu" stroke="#1A998F" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Lợi nhuận" name="Lợi nhuận" stroke="#e73108" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueSummary;