"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { date: "01/12", books: 1200, stationery: 600 },
  { date: "02/12", books: 2100, stationery: 900 },
  { date: "03/12", books: 800, stationery: 400 },
  { date: "04/12", books: 1600, stationery: 700 },
  { date: "05/12", books: 900, stationery: 300 },
  { date: "06/12", books: 1700, stationery: 800 },
  { date: "07/12", books: 2200, stationery: 1000 },
];

const RevenueSummary = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-semibold text-[#102E3C]">15,725,000 VNĐ</h2>
        <p className="text-sm text-gray-500">Doanh thu</p>
      </div>

      {/* Biểu đồ */}
      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            {/* Đường doanh thu sách */}
            <Line
              type="monotone"
              dataKey="books"
              name="Sách"
              stroke="#1A998F"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

            {/* Đường doanh thu văn phòng phẩm */}
            <Line
              type="monotone"
              dataKey="stationery"
              name="Văn phòng phẩm"
              stroke="#e73108"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Note / Legend */}
      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1">
          <span className="block w-3 h-3 bg-[#1A998F] rounded-full"></span>
          <span className="text-sm text-gray-600">Sách</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="block w-3 h-3 bg-[#e73108] rounded-full"></span>
          <span className="text-sm text-gray-600">Văn phòng phẩm</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueSummary;
