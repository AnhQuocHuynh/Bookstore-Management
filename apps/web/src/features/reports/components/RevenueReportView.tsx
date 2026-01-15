import React, { useState, useMemo } from "react";
import { DatePicker, Empty, Spin, Select } from "antd";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, Tooltip as RechartsTooltip
} from "recharts";
import { DollarSign, Package, TrendingUp, ShoppingBag, ArrowUp, ArrowDown } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useRevenueReport } from "../hooks/useReports";
import { formatCurrency } from "@/utils";
import { DashboardCards, LineChartData, PieChartData, TopProduct, MetricItem } from "../types";

const { RangePicker } = DatePicker;

// --- 1. COMPONENT: PIE CHART (Góc trái trên) ---
const PieChartSection = ({ data }: { data: PieChartData }) => {
    const COLORS = ['#14b8a6', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6']; // Teal, Blue, Pink, Amber, Violet

    if (!data?.items || data.items.length === 0)
        return <div className="bg-white rounded-2xl p-6 h-64 flex items-center justify-center border border-zinc-100 text-gray-400">Chưa có dữ liệu</div>;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-neutral-800 text-xl font-bold font-['Roboto']">Doanh số theo Hàng hóa</h2>
                <div className="px-4 py-1 border-2 border-teal-600 rounded-full text-cyan-950 font-bold text-sm bg-teal-50">
                    {dayjs().format('DD/MM/YYYY')}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Vòng tròn biểu đồ */}
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
                                cornerRadius={10}
                            >
                                {data.items.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Text ở giữa */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-['Roboto'] pointer-events-none">
                        <span className="text-neutral-500 text-sm">Total Value</span>
                        <span className="text-cyan-950 text-2xl font-bold">
                            {(data.total / 1000000).toFixed(1)}Tr
                        </span>
                    </div>
                </div>

                {/* Legend (Danh sách bên phải) */}
                <div className="flex-1 w-full space-y-2 text-sm font-['Roboto']">
                    <div className="flex justify-between items-center p-1 border-b border-gray-100 pb-2 mb-2">
                        <span className="text-neutral-500 font-medium">Label</span>
                        <div className="flex gap-4">
                            <span className="text-neutral-500 w-20 text-right font-medium">Value</span>
                            <span className="text-neutral-500 w-12 text-right font-medium">%</span>
                        </div>
                    </div>

                    {data.items.slice(0, 5).map((item, index) => (
                        <div key={item.productId} className="flex justify-between items-center py-1">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="truncate text-cyan-950 font-medium" title={item.name}>{item.name}</span>
                            </div>
                            <div className="flex gap-4 flex-shrink-0">
                                <span className="font-bold text-cyan-950 w-20 text-right">
                                    {item.value >= 1000000 ? `${(item.value / 1000000).toFixed(1)}Tr` : `${(item.value / 1000).toFixed(0)}K`}
                                </span>
                                <span className="font-bold text-gray-500 w-12 text-right">{item.percent.toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 2. COMPONENT: SUMMARY CARDS (Góc trái dưới - 2x2 Grid) ---
const SummarySection = ({ cards }: { cards: DashboardCards }) => {
    // Helper để render thẻ card
    const renderCard = (
        title: string,
        metric: MetricItem,
        icon: React.ReactNode,
        iconBg: string,
        textColor: string
    ) => {
        const value = metric.value ?? metric.count ?? metric.total ?? 0;
        const growth = metric.growthPercent;

        return (
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-zinc-100 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-cyan-900 font-medium text-lg">{title}</span>
                    <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <div className={`text-cyan-950 text-2xl font-bold mb-2`}>
                        {metric.count || metric.total ? value : formatCurrency(value)}
                    </div>
                    {growth != null ? (
                        <div className={`text-sm font-medium flex items-center gap-1 ${growth >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                            <span className="text-gray-400 font-normal ml-1">so với kỳ trước</span>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">-</div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {renderCard("Lợi nhuận", cards.profit, <DollarSign size={20} className="text-teal-600" />, "bg-teal-100", "text-cyan-950")}
            {renderCard("Số Đơn Hàng", cards.orders, <ShoppingBag size={20} className="text-teal-600" />, "bg-emerald-100", "text-cyan-950")}
            {renderCard("Tiền nhập hàng", cards.purchaseSpend, <TrendingUp size={20} className="text-red-500" />, "bg-red-50", "text-gray-400")}
            {renderCard("SP bán ra", cards.itemsSold, <Package size={20} className="text-teal-600" />, "bg-emerald-100", "text-cyan-950")}
        </div>
    );
};

// --- 3. COMPONENT: RIGHT COLUMN (Chart & Top Products) ---
const RightColumn = ({
    chartData,
    topProducts,
    dateRange,
    onDateChange
}: {
    chartData: LineChartData,
    topProducts: TopProduct[],
    dateRange: any,
    onDateChange: (dates: any) => void
}) => {

    // Transform data cho BarChart
    const barsData = useMemo(() => {
        if (!chartData?.labels) return [];
        return chartData.labels.map((label, index) => {
            // Tính tổng doanh thu của tất cả dataset tại ngày đó
            const totalRevenue = chartData.datasets.reduce((acc, ds) => acc + (ds.values[index] || 0), 0);
            return { time: label, value: totalRevenue };
        });
    }, [chartData]);

    const totalRevenuePeriod = barsData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="bg-[#eaf4f4] rounded-[20px] p-6 h-full border border-teal-200 flex flex-col">
            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white border-2 border-teal-600 rounded-full px-4 py-1 text-sm font-bold text-cyan-950 flex items-center">
                    Tất cả Sản phẩm
                </div>
                <div className="bg-white rounded-full overflow-hidden border-2 border-teal-600">
                    <RangePicker
                        value={dateRange}
                        onChange={onDateChange}
                        bordered={false}
                        suffixIcon={null}
                        allowClear={false}
                        className="py-1"
                        format="DD/MM/YYYY"
                    />
                </div>
            </div>

            {/* Bar Chart Section */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-zinc-100 shadow-sm">
                <div className="mb-6">
                    <div className="text-cyan-950 text-3xl font-bold">{formatCurrency(totalRevenuePeriod)}</div>
                    <div className="text-gray-500 text-sm">Doanh thu theo thời gian</div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="time"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickFormatter={(val) => dayjs(val).format('DD/MM')}
                                dy={10}
                            />
                            <RechartsTooltip
                                cursor={{ fill: '#f4f4f5' }}
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(val: any) => [formatCurrency(val), 'Doanh thu']}
                            />
                            <Bar
                                dataKey="value"
                                fill="#14b8a6"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products List */}
            <div className="flex-1">
                <h3 className="text-cyan-950 text-2xl font-bold mb-4">Các sản phẩm bán chạy:</h3>
                <div className="bg-white rounded-xl p-2 space-y-1 shadow-sm overflow-y-auto max-h-[400px] custom-scrollbar">
                    {topProducts.length === 0 && <div className="p-4 text-center text-gray-400">Không có dữ liệu</div>}

                    {topProducts.map((p, idx) => (
                        <div key={p.productId} className={`flex items-center gap-4 p-4 ${idx !== topProducts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">Img</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-lg font-medium text-cyan-950 truncate" title={p.name}>{p.name}</div>
                                <div className="text-gray-400 text-sm font-roboto">{p.sku}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-teal-600 font-bold text-lg">{formatCurrency(p.revenue)}</div>
                                <div className="text-xs text-gray-500">{p.percent.toFixed(2)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
type RangeValue = [Dayjs | null, Dayjs | null] | null;

export const RevenueReportView = () => {
    const [dateRange, setDateRange] = useState<RangeValue>([dayjs().startOf('month'), dayjs()]);

    const queryParams = {
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD'),
        period: 'day' as const,
        topN: 6
    };

    const { data, isLoading, isError } = useRevenueReport(queryParams);
    const handleDateChange = (dates: any) => setDateRange(dates as RangeValue);

    if (isError) return <div className="p-10 text-center text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>;
    if (isLoading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen font-['Inter']">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
                <div>
                    <h1 className="text-cyan-950 text-4xl font-bold leading-9">Thống kê Doanh thu</h1>
                </div>
                <div className="text-cyan-950 text-lg opacity-70 mt-2 md:mt-0">
                    Thời gian đồng bộ gần nhất: {data?.meta?.lastDataAt ? dayjs(data.meta.lastDataAt).format('DD/MM/YYYY hh:mm A') : '...'}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT COLUMN (6/12) */}
                <div className="col-span-12 xl:col-span-6 flex flex-col gap-8">
                    {/* Pie Chart */}
                    <PieChartSection data={data?.pie || { total: 0, items: [] }} />

                    {/* Summary Cards */}
                    <div className="flex-1">
                        {data?.cards && <SummarySection cards={data.cards} />}
                    </div>
                </div>

                {/* RIGHT COLUMN (6/12) */}
                <div className="col-span-12 xl:col-span-6">
                    <RightColumn
                        chartData={data?.line || { labels: [], datasets: [] }}
                        topProducts={data?.top || []}
                        dateRange={dateRange}
                        onDateChange={handleDateChange}
                    />
                </div>

            </div>
        </div>
    );
};