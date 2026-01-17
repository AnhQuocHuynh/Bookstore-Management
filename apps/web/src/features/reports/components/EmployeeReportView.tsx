import React, { useState } from "react";
import { DatePicker, Spin, Pagination } from "antd";
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RechartsTooltip, CartesianGrid
} from "recharts";
import { User, Calendar, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import { useEmployeeReport } from "../hooks/useReports";
import { formatCurrency } from "@/utils";
import { EmployeePieItem, EmployeeBarData, EmployeeTableItem } from "../types";

const { RangePicker } = DatePicker;

// --- COMPONENT: PIE CHART SECTION (Chart Trên - List Dưới) ---
const EmployeePieSection = ({ data }: { data: { total: number, items: EmployeePieItem[] } }) => {
    const COLORS = ['#fdba74', '#fb923c', '#fde047', '#4ade80', '#60a5fa', '#c084fc', '#f472b6'];

    if (!data || data.items.length === 0) return <div className="h-64 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 mb-8 flex flex-col h-auto">
            <h2 className="font-bold text-neutral-800 text-xl mb-6">Tỷ trọng đơn hàng</h2>

            {/* UPDATE: Flex Column để xếp dọc */}
            <div className="flex flex-col items-center gap-6">

                {/* Chart Donut */}
                <div className="relative w-64 h-64 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.items as any[]}
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                cornerRadius={8}
                                stroke="none"
                            >
                                {data.items.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-neutral-400 text-sm font-medium">Tổng đơn</span>
                        <span className="text-3xl font-bold text-teal-600">{data.total}</span>
                    </div>
                </div>

                {/* Legend List (Ở dưới) */}
                <div className="w-full">
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {data.items.map((item, index) => (
                            <div key={item.employeeId} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-teal-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-neutral-700 font-medium truncate max-w-[150px]" title={item.employeeName}>{item.employeeName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-xs font-medium">{item.value} đơn</span>
                                    <span className="font-bold text-teal-700 w-12 text-right">{item.percent.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center p-2 border-t border-gray-100 pt-3 mt-2">
                        <div className="text-neutral-500 text-sm">Nhân viên: {data.items.length}</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- COMPONENT: BAR CHART SECTION (Scroll ngang + Text nghiêng) ---
const EmployeeBarSection = ({ data }: { data: EmployeeBarData }) => {
    const chartData = data?.labels ? data.labels.map((lbl, i) => ({ name: lbl, value: data.values[i] || 0 })) : [];

    // UPDATE: Tính toán độ rộng biểu đồ dựa trên số lượng nhân viên
    // Mỗi cột chiếm khoảng 60px, tối thiểu là 100% chiều rộng container
    const minChartWidth = Math.max(chartData.length * 80, 500);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex flex-col">
            <h2 className="font-bold text-neutral-800 text-xl mb-4">So sánh số lượng giao dịch</h2>

            {chartData.length > 0 ? (
                // Wrapper tạo scroll ngang
                <div className="w-full overflow-x-auto custom-scrollbar pb-4">
                    <div style={{ width: `${minChartWidth}px`, height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 60 }} // Bottom lớn để chứa text nghiêng
                            >
                                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    // UPDATE: Xoay chữ -45 độ
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0} // Hiển thị tất cả label không bỏ sót
                                    tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
                                    dy={10} // Đẩy xuống một chút
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#f0fdfa' }}
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#0d9488"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    name="Số đơn hàng"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
            )}
        </div>
    );
};

// --- COMPONENT: LEFT TRANSACTION TABLE ---
const TransactionList = ({
    transactions, page, total, setPage
}: {
    transactions: EmployeeTableItem[], page: number, total: number, setPage: (p: number) => void
}) => {
    return (
        <div className="bg-white rounded-[20px] shadow-lg border border-zinc-100 overflow-hidden flex flex-col h-full">
            <div className="bg-teal-600 p-5 text-white font-bold text-xl text-center flex-shrink-0">
                Lịch sử giao dịch nhân viên
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                        <tr className="text-cyan-950 font-bold border-b border-gray-200 text-sm">
                            <th className="p-4 text-center w-16">STT</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Nhân Viên</th>
                            <th className="p-4 text-right">Tổng Tiền</th>
                        </tr>
                    </thead>
                    <tbody className="text-cyan-950 text-sm">
                        {transactions.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Không có giao dịch nào</td></tr>
                        ) : (
                            transactions.map((item, index) => (
                                <tr key={item.transactionId} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100 hover:bg-teal-50 transition-colors`}>
                                    <td className="p-4 text-center text-gray-500">{(page - 1) * 20 + index + 1}</td>
                                    <td className="p-4 text-gray-500">
                                        {dayjs(item.occurredAt).format('HH:mm DD/MM')}
                                    </td>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-700">
                                            <User size={12} />
                                        </div>
                                        {item.employeeName}
                                    </td>
                                    <td className="p-4 text-right font-bold text-teal-600">
                                        {formatCurrency(item.totalAmount)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-3 border-t border-gray-200 bg-white flex justify-center flex-shrink-0">
                <Pagination
                    current={page}
                    total={total}
                    pageSize={20}
                    onChange={setPage}
                    size="small"
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

// --- MAIN VIEW ---
type RangeValue = [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;

export const EmployeeReportView = () => {
    const [dateRange, setDateRange] = useState<RangeValue>([dayjs().startOf('month'), dayjs()]);
    const [page, setPage] = useState(1);

    const queryParams = {
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD'),
        page,
        limit: 20
    };

    const { data, isLoading, isError } = useEmployeeReport(queryParams);
    const handleDateChange = (dates: any) => { setDateRange(dates); setPage(1); };

    if (isError) return (
        <div className="h-screen flex flex-col items-center justify-center text-red-500 bg-gray-50">
            <AlertCircle size={48} className="mb-4" />
            <div className="text-xl font-bold">Lỗi tải dữ liệu</div>
            <p className="text-gray-500 mt-2">Vui lòng kiểm tra kết nối hoặc đăng nhập lại</p>
        </div>
    );

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    return (
        <div className="p-6 md:p-8 bg-[#f8fafc] min-h-screen font-['Inter'] flex flex-col h-screen">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-cyan-950 leading-tight">Thống kê Hiệu suất</h1>
                    <p className="text-cyan-950 opacity-60 text-sm mt-1">Đánh giá năng suất làm việc nhân viên</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-white border border-teal-600 rounded-lg px-2 py-0.5 shadow-sm">
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            variant="borderless"
                            allowClear={false}
                            suffixIcon={<Calendar size={16} className="text-teal-600" />}
                            format="DD/MM/YYYY"
                        />
                    </div>
                    <div className="text-cyan-950 text-sm opacity-70">
                        Cập nhật: {data?.meta?.lastDataAt ? dayjs(data.meta.lastDataAt).format('HH:mm DD/MM/YYYY') : '...'}
                    </div>
                </div>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">

                {/* LEFT COLUMN (5/12): Transaction List */}
                <div className="col-span-12 xl:col-span-5 h-full min-h-0">
                    <TransactionList
                        transactions={data?.table?.items || []}
                        page={page}
                        total={data?.table?.total || 0}
                        setPage={setPage}
                    />
                </div>

                {/* RIGHT COLUMN (7/12): Charts Container */}
                <div className="col-span-12 xl:col-span-7 bg-teal-600/10 rounded-[20px] p-6 border border-teal-200 h-full overflow-y-auto custom-scrollbar flex flex-col gap-6">

                    {/* Pie Chart Section - Ở trên */}
                    <div className="flex-shrink-0">
                        <EmployeePieSection data={data?.pie || { total: 0, items: [] }} />
                    </div>

                    {/* Bar Chart Section - Ở dưới */}
                    <div className="flex-shrink-0">
                        <EmployeeBarSection data={data?.bar || { labels: [], values: [] }} />
                    </div>

                </div>

            </div>
        </div>
    );
};