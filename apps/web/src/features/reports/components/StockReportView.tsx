import React, { useState } from "react";
import { Table, Input, Select, Tag, Progress, Empty, Spin, Button, Pagination } from "antd";
import {
    BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts";
import { Search, AlertCircle, CheckCircle, Package, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import dayjs from "dayjs";
import { useStockReport } from "../hooks/useReports";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { StockTableItem, StockChartData } from "../types";

// --- HELPER: Render Status Badge ---
const getStatusConfig = (status: string) => {
    switch (status) {
        case 'Lỗi tồn kho': return { color: 'red', icon: <AlertCircle size={14} />, bg: 'bg-red-50', text: 'text-red-600' };
        case 'Sắp hết hàng': return { color: 'orange', icon: <TrendingDown size={14} />, bg: 'bg-orange-50', text: 'text-orange-600' };
        case 'Dư hàng': return { color: 'blue', icon: <TrendingUp size={14} />, bg: 'bg-blue-50', text: 'text-blue-600' };
        case 'Bình thường': default: return { color: 'green', icon: <CheckCircle size={14} />, bg: 'bg-green-50', text: 'text-green-600' };
    }
};

// --- COMPONENT: CHART DETAIL (Bên phải) ---
const ProductDetailPanel = ({
    salesData, importData, productName,
    salesPeriod, setSalesPeriod
}: {
    salesData?: StockChartData, importData?: StockChartData, productName?: string,
    salesPeriod: string, setSalesPeriod: (v: string) => void
}) => {

    // Transform Data cho Recharts
    const formatData = (chartData?: StockChartData) => {
        if (!chartData?.labels) return [];
        return chartData.labels.map((lbl, i) => ({
            name: lbl,
            value: chartData.values[i] || 0
        }));
    };

    if (!salesData && !importData) return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="text-center">Chọn một sản phẩm từ bảng bên trái<br />để xem biểu đồ chi tiết Nhập/Xuất</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm sticky top-0 z-10">
                <h3 className="text-lg font-bold text-cyan-950 mb-1">Chi tiết biến động</h3>
                <p className="text-teal-600 font-medium truncate" title={productName}>{productName}</p>
            </div>

            {/* 1. Biểu đồ Bán hàng (Sales) */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><TrendingUp size={16} /></div>
                        <span className="font-bold text-gray-700">Xuất bán</span>
                    </div>
                    <Select
                        value={salesPeriod}
                        onChange={setSalesPeriod}
                        size="small"
                        options={[
                            { label: 'Ngày', value: 'day' },
                            { label: 'Tuần', value: 'week' },
                            { label: 'Tháng', value: 'month' }
                        ]}
                        className="w-24"
                    />
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formatData(salesData)}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                            <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Biểu đồ Nhập hàng (Import) */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><ArrowRightLeft size={16} /></div>
                        <span className="font-bold text-gray-700">Nhập kho</span>
                    </div>
                    {/* Có thể thêm state importPeriod riêng nếu muốn */}
                    <div className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">Gần đây</div>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatData(importData)}>
                            <CartesianGrid vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                            <RechartsTooltip cursor={{ fill: '#fff7ed' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- MAIN VIEW ---
export const StockReportView = () => {
    // State Filter Table
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("stockQuantity"); // Mặc định sort theo tồn kho
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>("ASC"); // Ít -> Nhiều (để thấy hàng sắp hết)

    // State Detail (Chart)
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
    const [salesPeriod, setSalesPeriod] = useState<any>('day');

    // Load Categories
    const { data: categoriesData, isLoading: catLoading } = useCategories();

    // Load Report Data
    const { data, isLoading, isError } = useStockReport({
        page,
        limit: 10,
        search: keyword || undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        sortBy,
        sortOrder,
        // Params cho chart (chỉ chạy khi có selectedProductId)
        productId: selectedProductId,
        salesPeriod: salesPeriod
    });

    // Table Columns
    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            render: (text: string, record: StockTableItem) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                        {record.imageUrl ? <img src={record.imageUrl} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-cyan-950 truncate max-w-[180px]" title={text}>{text}</div>
                        <div className="text-xs text-gray-500">{record.sku}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stockQuantity',
            width: 100,
            sorter: true,
            align: 'center' as const,
            render: (val: number) => <span className="font-bold text-cyan-950">{val}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 180,
            render: (status: string, record: StockTableItem) => {
                const conf = getStatusConfig(status);
                return (
                    <div className="flex flex-col gap-1">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${conf.text}`}>
                            {conf.icon} {status}
                        </div>
                        <Progress
                            percent={Math.min(record.statusPercent, 100)}
                            size="small"
                            showInfo={false}
                            strokeColor={conf.color}
                            trailColor="rgba(0,0,0,0.05)"
                        />
                    </div>
                );
            }
        }
    ];

    // Handle Table Change (Sort/Page)
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        if (pagination.current) setPage(pagination.current);
        if (sorter.field) {
            setSortBy(sorter.field as string);
            setSortOrder(sorter.order === 'descend' ? 'DESC' : 'ASC');
        }
    };

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-['Inter'] h-screen flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-950">Báo cáo Tồn kho</h1>
                    <p className="text-cyan-950 opacity-70 text-sm">Theo dõi nhập xuất và cảnh báo hàng hóa</p>
                </div>
                <div className="text-xs font-mono text-gray-400 bg-white px-3 py-1 rounded-full border">
                    Last sync: {data?.meta?.lastDataAt ? dayjs(data.meta.lastDataAt).format('HH:mm DD/MM') : '...'}
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

                {/* LEFT COLUMN: TABLE (Chiếm 8 phần) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 h-full">

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex flex-wrap gap-3 items-center">
                        <Input
                            prefix={<Search size={16} className="text-gray-400" />}
                            placeholder="Tìm tên hoặc SKU..."
                            className="w-[200px] rounded-lg"
                            allowClear
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setPage(1); // Reset về trang 1 khi search
                            }}
                        />
                        <Select
                            mode="multiple"
                            placeholder="Lọc danh mục"
                            className="min-w-[180px] custom-select-teal"
                            maxTagCount="responsive"
                            options={categoriesData?.data?.map((c: any) => ({ label: c.name, value: c.id }))}
                            value={categoryIds}
                            onChange={(vals) => {
                                setCategoryIds(vals);
                                setPage(1);
                            }}
                            loading={catLoading}
                        />
                        <Button
                            onClick={() => {
                                setKeyword("");
                                setCategoryIds([]);
                                setSortBy("stockQuantity");
                                setSortOrder("ASC");
                                setSelectedProductId(undefined);
                            }}
                            type="dashed"
                            className="ml-auto"
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 flex-1 overflow-hidden flex flex-col">
                        <Table
                            dataSource={data?.table?.items || []}
                            columns={columns}
                            rowKey="productId"
                            loading={isLoading}
                            onChange={handleTableChange}
                            pagination={false} // Tắt pagination mặc định của Antd để dùng custom cho đẹp
                            scroll={{ y: 'calc(100vh - 350px)' }} // Auto scroll height
                            rowClassName={(record) =>
                                `cursor-pointer transition-colors hover:bg-teal-50 ${selectedProductId === record.productId ? 'bg-teal-50 border-l-4 border-teal-500' : ''}`
                            }
                            onRow={(record) => ({
                                onClick: () => setSelectedProductId(record.productId)
                            })}
                        />
                        {/* Custom Footer Pagination */}
                        <div className="p-3 border-t border-gray-100 flex justify-end">
                            <Pagination
                                current={page}
                                total={data?.table?.total || 0}
                                pageSize={10}
                                onChange={setPage}
                                size="small"
                                showTotal={(total) => `Tổng ${total} SP`}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILS (Chiếm 4 phần) */}
                <div className="col-span-12 lg:col-span-4 h-full">
                    <div className="bg-teal-600/5 h-full rounded-[20px] p-4 border border-teal-100">
                        {isLoading && selectedProductId ? (
                            <div className="h-full flex items-center justify-center"><Spin /></div>
                        ) : (
                            <ProductDetailPanel
                                salesData={data?.salesChart}
                                importData={data?.importChart}
                                // Lấy tên sản phẩm từ chart hoặc tìm trong table list
                                productName={data?.salesChart?.productName || data?.table?.items.find(i => i.productId === selectedProductId)?.name}
                                salesPeriod={salesPeriod}
                                setSalesPeriod={setSalesPeriod}
                            />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};