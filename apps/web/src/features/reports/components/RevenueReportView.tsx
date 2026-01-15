import React, { useState, useMemo } from "react";
import { DatePicker, Spin, Select } from "antd";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, Tooltip as RechartsTooltip, CartesianGrid
} from "recharts";
import { DollarSign, Package, TrendingUp, ShoppingBag, Calendar } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useRevenueReport } from "../hooks/useReports";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { formatCurrency } from "@/utils";
import { DashboardCards, LineChartData, PieChartData, TopProduct, MetricItem } from "../types";

const { RangePicker } = DatePicker;

// --- 1. COMPONENT: PIE CHART SECTION (Chart trên - Legend dưới) ---
const PieChartSection = ({ data }: { data: PieChartData }) => {
    const COLORS = ['#14b8a6', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#94a3b8']; // Màu cuối cùng (xám) dành cho "Còn lại"

    const totalValue = data?.total || 0;

    // --- LOGIC MỚI: GỘP "CÒN LẠI" ---
    const displayItems = useMemo(() => {
        if (!data?.items) return [];

        // Nếu ít hơn hoặc bằng 4 item thì hiển thị hết
        if (data.items.length <= 4) return data.items;

        // Lấy top 4
        const top4 = data.items.slice(0, 4);

        // Tính tổng phần còn lại
        const others = data.items.slice(4);
        const otherValue = others.reduce((acc, curr) => acc + curr.value, 0);
        const otherPercent = others.reduce((acc, curr) => acc + curr.percent, 0);

        // Trả về mảng mới gồm Top 4 + Item "Còn lại"
        return [
            ...top4,
            {
                productId: 'others',
                name: 'Còn lại',
                value: otherValue,
                percent: otherPercent,
                // Các trường optional khác có thể bỏ qua hoặc fake
                sku: '',
                imageUrl: ''
            }
        ];
    }, [data]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-neutral-800">Doanh số theo Hàng hóa</h2>
                <div className="px-3 py-1 border border-teal-600 rounded-full text-cyan-950 font-bold text-xs bg-teal-50">
                    {dayjs().format('DD/MM/YYYY')}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 flex-1">

                {/* Chart Donut */}
                <div className="relative w-56 h-56 flex-shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                // Dùng displayItems đã gộp để vẽ chart
                                data={displayItems as any[]}
                                innerRadius={75}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                cornerRadius={6}
                            >
                                {displayItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <p className="text-neutral-500 text-sm">Total Value</p>
                        <p className="text-2xl font-bold text-cyan-950">
                            {totalValue >= 1000000 ? `${(totalValue / 1000000).toFixed(1)}Tr` : `${(totalValue / 1000).toFixed(0)}K`}
                        </p>
                    </div>
                </div>

                {/* Legend List (Ở dưới) */}
                <div className="w-full space-y-2 text-sm flex-1 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-12 text-neutral-500 font-medium pb-2 border-b border-gray-100">
                        <span className="col-span-6 pl-2">Nhãn</span>
                        <span className="col-span-4 text-right">Giá trị</span>
                        <span className="col-span-2 text-right pr-2">%</span>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-[150px]">
                        {/* Render displayItems thay vì data.items */}
                        {displayItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-2 transition-colors">
                                <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                                    <i className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></i>
                                    <span className="truncate text-neutral-700 font-medium" title={item.name}>{item.name}</span>
                                </div>
                                <div className="col-span-4 text-right font-bold text-cyan-950">
                                    {item.value >= 1000000 ? `${(item.value / 1000000).toFixed(1)}Tr` : `${(item.value / 1000).toFixed(0)}K`}
                                </div>
                                <div className="col-span-2 text-right text-neutral-500">{item.percent.toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. COMPONENT: SUMMARY CARDS (Giữ nguyên) ---
const SummaryGrid = ({ cards }: { cards: DashboardCards }) => {
    const renderCard = (title: string, metric: MetricItem, icon: React.ReactNode, bgIcon: string, isCurrency: boolean = false) => {
        const value = metric.value ?? metric.count ?? metric.total ?? 0;
        const growth = metric.growthPercent;

        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-cyan-900 font-medium">{title}</span>
                    <div className={`p-2 ${bgIcon} rounded-full`}>{icon}</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-cyan-950 mb-1">
                        {isCurrency
                            ? formatCurrency(value)
                            : (metric.count || metric.total) ? value : formatCurrency(value)
                        }
                    </div>
                    {growth != null ? (
                        <div className={`text-sm font-medium ${growth >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% so với kỳ trước
                        </div>
                    ) : <div className="text-gray-400 text-sm">-</div>}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderCard("Lợi nhuận", cards.profit, <TrendingUp size={20} className="text-teal-600" />, "bg-teal-100", true)}
            {renderCard("Sản phẩm bán được", cards.itemsSold, <Package size={20} className="text-teal-600" />, "bg-emerald-100", false)}
            {renderCard("Số đơn hàng", cards.orders, <ShoppingBag size={20} className="text-blue-600" />, "bg-blue-100", false)}
            {renderCard("Tiền nhập hàng", cards.purchaseSpend, <DollarSign size={20} className="text-orange-600" />, "bg-orange-100", true)}
        </div>
    );
};

// --- 3. COMPONENT: RIGHT COLUMN CONTENT (Giữ nguyên) ---
const RightColumnSection = ({
    chartData, topProducts, dateRange, onDateChange,
    categoryIds, onCategoryChange
}: {
    chartData: LineChartData, topProducts: TopProduct[],
    dateRange: any, onDateChange: any,
    categoryIds: string[], onCategoryChange: (ids: string[]) => void
}) => {

    const { data: categoriesData, isLoading: isLoadingCats } = useCategories();
    const categories = categoriesData?.data || [];

    const data = useMemo(() => {
        if (!chartData?.labels) return [];
        return chartData.labels.map((label, index) => {
            const item: any = { time: label };
            let total = 0;
            chartData.datasets.forEach(ds => {
                item[ds.name] = ds.values[index] || 0;
                total += ds.values[index] || 0;
            });
            item['total'] = total;
            return item;
        });
    }, [chartData]);

    const totalRevenue = data.reduce((acc, cur) => acc + cur.total, 0);

    return (
        <div className="bg-teal-600/10 p-6 rounded-[20px] space-y-6 h-full flex flex-col">

            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex-1 min-w-[200px]">
                    <Select
                        mode="multiple"
                        placeholder="Lọc theo Danh mục"
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                        value={categoryIds}
                        onChange={onCategoryChange}
                        loading={isLoadingCats}
                        options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                        className="custom-select-teal"
                    />
                </div>
                <div className="bg-white border border-teal-600 rounded-lg px-2 py-0.5 shadow-sm flex items-center">
                    <RangePicker
                        value={dateRange}
                        onChange={onDateChange}
                        bordered={false}
                        suffixIcon={<Calendar size={16} className="text-teal-600" />}
                        allowClear={false}
                        className="w-[230px]"
                        format="DD/MM/YYYY"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex-shrink-0">
                <div className="mb-4">
                    <h3 className="text-3xl font-bold text-cyan-950">{formatCurrency(totalRevenue)}</h3>
                    <p className="text-neutral-500">Doanh thu theo thời gian</p>
                </div>
                <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickFormatter={(val) => dayjs(val).format('DD/MM')}
                                dy={10}
                            />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(val: any) => formatCurrency(Number(val))}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#14b8a6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl flex-1 border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold text-cyan-950 mb-4 flex-shrink-0">Các sản phẩm bán chạy:</h3>
                <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
                    {topProducts.length === 0 && <div className="text-center text-gray-400 py-4">Chưa có dữ liệu</div>}
                    {topProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <img
                                className="w-12 h-12 rounded-lg bg-gray-100 object-cover border border-gray-200"
                                src={p.imageUrl || "https://placehold.co/80x80?text=No+Img"}
                                alt="product"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-base text-cyan-950 truncate" title={p.name}>{p.name}</p>
                                <p className="text-neutral-500 text-xs uppercase">{p.sku}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-teal-600 font-bold text-base">{formatCurrency(p.revenue)}</p>
                                <p className="text-neutral-400 text-xs">{p.percent.toFixed(1)}%</p>
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
    const [categoryIds, setCategoryIds] = useState<string[]>([]);

    const queryParams = {
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD'),
        period: 'day' as const,
        topN: 6,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined
    };

    const { data, isLoading, isError } = useRevenueReport(queryParams);
    const handleDateChange = (dates: any) => setDateRange(dates as RangeValue);

    if (isError) return <div className="p-10 text-center text-red-500">Lỗi tải dữ liệu. Vui lòng đăng nhập lại.</div>;
    if (isLoading) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-['Inter']">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-cyan-950">Thống kê Doanh thu</h1>
                <p className="text-cyan-950 opacity-70 hidden md:block text-sm">
                    Cập nhật: {data?.meta?.lastDataAt ? dayjs(data.meta.lastDataAt).format('HH:mm DD/MM/YYYY') : '...'}
                </p>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">

                <div className="col-span-12 xl:col-span-5 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Chart & Legend đã được update logic "Còn lại" */}
                    <div className="flex-[1.2] min-h-0">
                        <PieChartSection data={data?.pie || { total: 0, items: [] }} />
                    </div>

                    <div className="flex-1 min-h-0">
                        {data?.cards && <SummaryGrid cards={data.cards} />}
                    </div>
                </div>

                <div className="col-span-12 xl:col-span-7 h-full">
                    <RightColumnSection
                        chartData={data?.line || { labels: [], datasets: [] }}
                        topProducts={data?.top || []}
                        dateRange={dateRange}
                        onDateChange={handleDateChange}
                        categoryIds={categoryIds}
                        onCategoryChange={setCategoryIds}
                    />
                </div>

            </div>
        </div>
    );
};