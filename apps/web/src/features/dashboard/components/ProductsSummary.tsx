// file: components/ProductsSummary.tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ChartResponse } from "../types/dashboard";
import { useMemo } from "react";
import { Spin } from "antd";

interface ProductSummaryProps {
  data?: ChartResponse;
  isLoading: boolean;
  totalItems?: number;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ data, isLoading, totalItems }) => {
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
        <h2 className="text-lg font-semibold text-[#102E3C]">{totalItems ?? 0}</h2>
        <p className="text-sm text-gray-500">Sản phẩm bán được</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis width={30} />
            <Tooltip />
            <Legend />
            {/* Backend trả về: Tổng sản phẩm, Sách, Văn phòng phẩm, Sản phẩm khác */}
            <Line type="monotone" dataKey="Sách" stroke="#1A998F" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Văn phòng phẩm" stroke="#e73108" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Sản phẩm khác" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductSummary;