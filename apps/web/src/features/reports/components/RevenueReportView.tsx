import React, { useState, useMemo } from "react";
import { DatePicker, Spin, Select, Segmented, InputNumber, Input } from "antd";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, Tooltip as RechartsTooltip, CartesianGrid
} from "recharts";
import { DollarSign, Package, TrendingUp, ShoppingBag, Calendar, Search } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useRevenueReport, useReportCategories } from "../hooks/useReports";
import { formatCurrency } from "@/utils";
import { DashboardCards, LineChartData, PieChartData, TopProduct, MetricItem } from "../types";

const { RangePicker } = DatePicker;

// --- 1. COMPONENT: PIE CHART SECTION ---
const PieChartSection = ({ data }: { data: PieChartData }) => {
    // Tạo bảng màu đủ lớn cho Top N (ví dụ tối đa 20 màu)
    const COLORS = [
        '#14b8a6', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6',
        '#ef4444', '#84cc16', '#06b6d4', '#6366f1', '#d946ef',
        '#f43f5e', '#f97316', '#eab308', '#22c55e', '#10b981'
    ];
    const totalValue = data?.total || 0;

    // --- LOGIC MỚI: TopN + Others ---
    const displayItems = useMemo(() => {
        if (!data?.items || data.items.length === 0) return [];

        // 1. Lấy danh sách items từ API (API đã trả về đúng TopN rồi)
        const currentItems = data.items;

        // 2. Tính tổng giá trị của các items đang hiển thị
        const currentSum = currentItems.reduce((acc, curr) => acc + curr.value, 0);

        // 3. Tính giá trị "Còn lại" (Total - Sum)
        // Lưu ý: Đôi khi làm tròn số liệu có thể gây lệch nhỏ, nên chỉ hiện nếu > 0
        const otherValue = totalValue - currentSum;
        const otherPercent = 100 - currentItems.reduce((acc, curr) => acc + curr.percent, 0);

        // 4. Nếu có phần dư đáng kể (> 1% hoặc > 0đ), thêm mục "Còn lại"
        if (otherValue > 0) {
            return [
                ...currentItems,
                {
                    productId: 'others',
                    name: 'Sản phẩm khác', // Đổi tên cho thân thiện
                    value: otherValue,
                    percent: otherPercent > 0 ? otherPercent : 0,
                    sku: '',
                    imageUrl: ''
                }
            ];
        }

        return currentItems;
    }, [data, totalValue]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-neutral-800">Tỷ trọng Doanh thu</h2>
                <div className="px-3 py-1 border border-teal-600 rounded-full text-cyan-950 font-bold text-xs bg-teal-50">
                    {dayjs().format('DD/MM/YYYY')}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6 flex-1 min-h-0">
                {/* Chart Donut */}
                <div className="relative w-56 h-56 flex-shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={displayItems as any[]}
                                innerRadius={75}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                cornerRadius={4}
                            >
                                {displayItems.map((entry, index) => {
                                    // Nếu là mục "Sản phẩm khác" thì dùng màu xám (màu cuối) hoặc màu riêng
                                    const color = entry.productId === 'others' ? '#94a3b8' : COLORS[index % COLORS.length];
                                    return <Cell key={`cell-${index}`} fill={color} stroke="none" />;
                                })}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <p className="text-neutral-500 text-sm">Tổng thu</p>
                        <p className="text-2xl font-bold text-cyan-950">
                            {totalValue >= 1000000000
                                ? `${(totalValue / 1000000000).toFixed(1)}B`
                                : totalValue >= 1000000
                                    ? `${(totalValue / 1000000).toFixed(1)}M`
                                    : `${(totalValue / 1000).toFixed(0)}K`}
                        </p>
                    </div>
                </div>

                {/* Legend List */}
                <div className="w-full space-y-2 text-sm flex-1 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-12 text-neutral-500 font-medium pb-2 border-b border-gray-100">
                        <span className="col-span-6 pl-2">Sản phẩm</span>
                        <span className="col-span-4 text-right">Giá trị</span>
                        <span className="col-span-2 text-right pr-2">%</span>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-[150px]">
                        {displayItems.map((item, index) => {
                            const color = item.productId === 'others' ? '#94a3b8' : COLORS[index % COLORS.length];
                            return (
                                <div key={index} className="grid grid-cols-12 items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-2 transition-colors">
                                    <div className="col-span-6 flex items-center gap-2 overflow-hidden">
                                        <i className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></i>
                                        <span className="truncate text-neutral-700 font-medium" title={item.name}>{item.name}</span>
                                    </div>
                                    <div className="col-span-4 text-right font-bold text-cyan-950">
                                        {formatCurrency(item.value)}
                                    </div>
                                    <div className="col-span-2 text-right text-neutral-500">{item.percent.toFixed(1)}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. COMPONENT: SUMMARY GRID (Giữ nguyên) ---
const SummaryGrid = ({ cards }: { cards: DashboardCards }) => {
    // ... Code cũ giữ nguyên
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

// --- 3. COMPONENT: RIGHT COLUMN ---
const RightColumnSection = ({
    chartData, topProducts,
    dateRange, onDateChange,
    categoryIds, onCategoryChange,
    period, onPeriodChange,
    search, onSearchChange,
    topN, onTopNChange
}: {
    chartData: LineChartData, topProducts: TopProduct[],
    dateRange: any, onDateChange: any,
    categoryIds: string[], onCategoryChange: (ids: string[]) => void,
    period: string, onPeriodChange: (val: string) => void,
    search: string, onSearchChange: (val: string) => void,
    topN: number, onTopNChange: (val: number | null) => void
}) => {
    const { data: categories = [], isLoading: isLoadingCats } = useReportCategories();

    // FIX: Tính toán data chart an toàn hơn
    const data = useMemo(() => {
        if (!chartData?.labels) return [];
        return chartData.labels.map((label, index) => {
            const item: any = { time: label };
            let total = 0;
            // dataset có thể rỗng nếu không có dữ liệu
            (chartData.datasets || []).forEach(ds => {
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
            {/* FILTER BAR 1 */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[150px]">
                    <Input
                        prefix={<Search size={14} className="text-gray-400" />}
                        placeholder="Tìm sản phẩm..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600"
                    />
                </div>
                <div className="flex-[2] min-w-[200px]">
                    <Select
                        mode="multiple"
                        placeholder="Lọc Danh mục"
                        style={{ width: '100%' }}
                        maxTagCount="responsive"
                        value={categoryIds}
                        onChange={onCategoryChange}
                        loading={isLoadingCats}
                        options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                        // FIX: Xóa prop styles={{ popup: ... }} gây lỗi TS
                        className="custom-select-teal"
                    />
                </div>
                <div className="w-[100px]" title="Số lượng Top sản phẩm">
                    <InputNumber
                        addonBefore="Top"
                        min={3} max={20}
                        value={topN}
                        onChange={onTopNChange}
                        className="w-full"
                    />
                </div>
            </div>

            {/* FILTER BAR 2 */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <Segmented
                    options={[
                        { label: 'Ngày', value: 'day' },
                        { label: 'Tuần', value: 'week' },
                        { label: 'Tháng', value: 'month' },
                    ]}
                    value={period}
                    onChange={(val) => onPeriodChange(val as string)}
                    className="bg-white text-teal-900 font-medium border border-teal-100 shadow-sm"
                />

                <div className="bg-white border border-teal-600 rounded-lg px-2 py-0.5 shadow-sm flex items-center">
                    <RangePicker
                        value={dateRange}
                        onChange={onDateChange}
                        variant="borderless"
                        suffixIcon={<Calendar size={16} className="text-teal-600" />}
                        allowClear={false}
                        className="w-[230px]"
                        format="DD/MM/YYYY"
                    />
                </div>
            </div>

            {/* CHART AREA */}
            <div className="bg-white p-6 rounded-xl border border-zinc-100 shadow-sm flex-shrink-0">
                <div className="mb-4 flex justify-between items-end">
                    <div>
                        <h3 className="text-3xl font-bold text-cyan-950">{formatCurrency(totalRevenue)}</h3>
                        <p className="text-neutral-500">Doanh thu theo thời gian</p>
                    </div>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100">
                        Theo {period === 'day' ? 'Ngày' : period === 'week' ? 'Tuần' : 'Tháng'}
                    </span>
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
                                tickFormatter={(val) => {
                                    if (period === 'month') return dayjs(val).format('MM/YY');
                                    return dayjs(val).format('DD/MM');
                                }}
                                dy={10}
                            />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(val: any) => formatCurrency(Number(val))}
                                labelFormatter={(val) => dayjs(val).format('DD/MM/YYYY')}
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

            {/* TOP LIST */}
            <div className="bg-white p-6 rounded-xl flex-1 border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold text-cyan-950 mb-4 flex-shrink-0">
                    Top {topN} sản phẩm bán chạy:
                </h3>
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

    // States
    const [period, setPeriod] = useState<string>('day');
    const [search, setSearch] = useState<string>('');
    const [topN, setTopN] = useState<number>(6); // Mặc định Top 6

    const queryParams = {
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD'),
        period: period as 'day' | 'week' | 'month',
        topN: topN,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        search: search || undefined
    };

    const { data, isLoading, isError } = useRevenueReport(queryParams);
    const handleDateChange = (dates: any) => setDateRange(dates as RangeValue);

    if (isError) return <div className="p-10 text-center text-red-500">Lỗi tải dữ liệu. Vui lòng đăng nhập lại.</div>;

    // FIX: Nếu đang loading lần đầu tiên (data undefined) thì hiện Spin.
    // Nếu đang loading background (khi đổi filter), data cũ vẫn còn -> Không hiện Spin.
    if (isLoading && !data) return <div className="h-screen flex items-center justify-center"><Spin size="large" /></div>;

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
                    <div className="flex-[1.2] min-h-0">
                        {/* Truyền dữ liệu vào PieChart */}
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
                        dateRange={dateRange} onDateChange={handleDateChange}
                        categoryIds={categoryIds} onCategoryChange={setCategoryIds}
                        period={period} onPeriodChange={setPeriod}
                        search={search} onSearchChange={setSearch}
                        topN={topN} onTopNChange={(val) => val && setTopN(val)}
                    />
                </div>
            </div>
        </div>
    );
};