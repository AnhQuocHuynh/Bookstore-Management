import React, { useState } from "react";
import { Table, Input, Select, Spin, Pagination, Segmented } from "antd";
import {
    BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { Search, AlertCircle, CheckCircle, Package, TrendingDown, ArrowUpDown } from "lucide-react";
import dayjs from "dayjs";
import { useStockReport, useReportCategories } from "../hooks/useReports";
import { StockTableItem, StockChartData } from "../types";

// ... (Giữ nguyên Helpers getStatusRowClass và Component ChartCard)
const getStatusRowClass = (status: string) => {
    switch (status) {
        case 'Lỗi tồn kho': return 'bg-red-50 text-red-600 hover:bg-red-100';
        case 'Sắp hết hàng': return 'bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium';
        case 'Dư hàng': return 'bg-emerald-50 text-cyan-950 hover:bg-emerald-100';
        case 'Bình thường': default: return 'bg-white text-cyan-950 hover:bg-gray-50';
    }
};

const ChartCard = ({
    title, data, barColor, emptyMessage
}: {
    title: string, data?: StockChartData, barColor: string, emptyMessage: string
}) => {
    const chartData = data?.labels ? data.labels.map((lbl, i) => ({ name: lbl, value: data.values[i] || 0 })) : [];

    return (
        <div className="bg-white p-6 rounded-[20px] shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-neutral-700 text-sm md:text-base">{title}</h3>
            </div>
            <div className="h-48 w-full" style={{ minHeight: '192px' }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#52525b', fontWeight: 600 }}
                                dy={10}
                            />
                            <RechartsTooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={barColor} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm flex-col text-center">
                        <Package size={32} className="mb-2 opacity-50" />
                        {emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export const StockReportView = () => {
    // State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("stockQuantity");
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>("ASC");
    const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

    const [productType, setProductType] = useState<string | undefined>(undefined);
    const [chartPeriod, setChartPeriod] = useState<string>('month');

    const { data: categories = [], isLoading: catLoading } = useReportCategories();

    const { data, isLoading, isError } = useStockReport({
        page,
        limit,
        search: keyword || undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        sortBy,
        sortOrder,
        productType,
        productId: selectedProductId,
        salesPeriod: chartPeriod as any,
        importPeriod: chartPeriod as any
    });

    const tableItems = data?.table?.items || [];
    const totalItems = data?.table?.total || 0;
    const lastSync = data?.meta?.lastDataAt;

    // Columns...
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            width: 60,
            align: 'center' as const,
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            title: 'Mã SP',
            dataIndex: 'sku',
            render: (text: string) => <span className="uppercase font-medium">{text}</span>
        },
        {
            title: 'Tên Sản phẩm',
            dataIndex: 'name',
            render: (text: string, record: StockTableItem) => (
                <div className="flex items-center gap-2">
                    {record.imageUrl && <img src={record.imageUrl} className="w-8 h-8 rounded border border-white shadow-sm object-cover" />}
                    <span className="truncate max-w-[150px]" title={text}>{text}</span>
                </div>
            )
        },
        {
            title: 'Tồn Kho',
            dataIndex: 'stockQuantity',
            align: 'center' as const,
            sorter: true,
            render: (val: number) => <span className="font-bold text-lg">{val}</span>
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            align: 'center' as const,
            render: (status: string) => {
                let icon = <CheckCircle size={16} />;
                if (status === 'Lỗi tồn kho') icon = <AlertCircle size={16} />;
                if (status === 'Sắp hết hàng') icon = <TrendingDown size={16} />;
                return <div className="flex items-center justify-center gap-1.5">{icon} <span>{status}</span></div>;
            }
        }
    ];

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        if (sorter.field) {
            setSortBy(sorter.field as string);
            setSortOrder(sorter.order === 'descend' ? 'DESC' : 'ASC');
        }
    };

    if (isError) return <div className="p-10 text-center text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>;

    return (
        <div className="p-6 md:p-8 bg-[#f1f5f9] min-h-screen font-['Inter']">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-cyan-950">Thống kê về Tồn Kho</h1>
                </div>
                <div className="text-cyan-950 text-base md:text-xl opacity-80">
                    Thời gian đồng bộ gần nhất: {lastSync ? dayjs(lastSync).format('DD/MM/YYYY hh:mm A') : '...'}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7 bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-200 flex flex-col h-[calc(100vh-180px)]">
                    <style>{`
            .custom-stock-table .ant-table-thead > tr > th {
              background: #0d9488 !important;
              color: white !important;
              text-align: center !important;
              font-weight: 700 !important;
              border-bottom: none !important;
              padding: 16px !important;
            }
            .custom-stock-table .ant-table-tbody > tr > td {
              border-bottom: 1px solid #f0f0f0;
              padding: 16px !important;
            }
          `}</style>

                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2 flex-wrap">
                        <Select
                            placeholder="Loại SP"
                            className="w-[120px]"
                            value={productType}
                            onChange={(val) => { setProductType(val); setPage(1); }}
                            allowClear
                            options={[
                                { label: 'Sách', value: 'book' },
                                { label: 'Văn phòng phẩm', value: 'stationery' },
                            ]}
                        />
                        <Select
                            placeholder="Hiển thị"
                            className="w-[100px]"
                            value={limit}
                            onChange={(val) => { setLimit(val); setPage(1); }}
                            options={[
                                { label: '10 dòng', value: 10 },
                                { label: '20 dòng', value: 20 },
                                { label: '50 dòng', value: 50 },
                            ]}
                        />
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {isLoading && !data ? (
                            <div className="h-full flex items-center justify-center"><Spin size="large" /></div>
                        ) : (
                            <div className="h-full overflow-y-auto custom-scrollbar">
                                <Table
                                    className="custom-stock-table"
                                    dataSource={tableItems}
                                    columns={columns}
                                    rowKey="productId"
                                    pagination={false}
                                    onChange={handleTableChange}
                                    rowClassName={(record) => `cursor-pointer transition-colors ${getStatusRowClass(record.status)} ${selectedProductId === record.productId ? 'ring-2 ring-inset ring-teal-500 z-10' : ''}`}
                                    onRow={(record) => ({ onClick: () => setSelectedProductId(record.productId) })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
                        <Pagination
                            current={page}
                            total={totalItems}
                            pageSize={limit}
                            onChange={setPage}
                            size="small"
                            showTotal={(total) => `Tổng ${total} SP`}
                        />
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                    <div className="flex flex-wrap gap-3 justify-end items-center">
                        <Input
                            prefix={<Search size={16} className="text-teal-700" />}
                            placeholder="Tìm SP..."
                            value={keyword}
                            onChange={e => { setKeyword(e.target.value); setPage(1); }}
                            className="w-[150px] rounded-full border-2 border-teal-600 font-bold text-cyan-950 placeholder:text-teal-700/50 bg-white"
                        />

                        <Select
                            placeholder="Lọc: Tất cả"
                            className="min-w-[160px] custom-rounded-select"
                            // FIX: Xóa styles gây lỗi TS
                            options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                            value={categoryIds.length > 0 ? categoryIds[0] : undefined}
                            onChange={(val) => { setCategoryIds(val ? [val] : []); setPage(1); }}
                            allowClear
                            suffixIcon={<ArrowUpDown size={14} className="text-teal-700" />}
                        />

                        <button
                            onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                            className="px-4 py-1.5 bg-white border-2 border-teal-600 rounded-full font-bold text-cyan-950 text-sm hover:bg-teal-50 flex items-center gap-2"
                        >
                            {sortOrder === 'ASC' ? 'Tăng' : 'Giảm'}
                        </button>
                    </div>

                    <div className="bg-slate-100 p-6 rounded-[20px] space-y-6 flex-1 border border-slate-200 flex flex-col">
                        <div className="flex justify-end">
                            <Segmented
                                options={[
                                    { label: 'Ngày', value: 'day' },
                                    { label: 'Tuần', value: 'week' },
                                    { label: 'Tháng', value: 'month' },
                                ]}
                                value={chartPeriod}
                                onChange={(val) => setChartPeriod(val as string)}
                                size="small"
                            />
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <ChartCard
                                title={selectedProductId
                                    ? `Bán hàng (${chartPeriod === 'day' ? '7 ngày' : chartPeriod === 'week' ? '4 tuần' : '12 tháng'}):`
                                    : "Số lượng Bán được"}
                                data={data?.salesChart}
                                barColor="#0d9488"
                                emptyMessage="Chọn sản phẩm để xem biểu đồ"
                            />
                            <ChartCard
                                title={selectedProductId
                                    ? `Nhập hàng (${chartPeriod === 'day' ? '7 ngày' : chartPeriod === 'week' ? '4 tuần' : '12 tháng'}):`
                                    : "Số lượng Nhập vào"}
                                data={data?.importChart}
                                barColor="#0d9488"
                                emptyMessage="Chọn sản phẩm để xem biểu đồ"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
        .custom-rounded-select .ant-select-selector {
          border: 2px solid #0d9488 !important;
          border-radius: 9999px !important;
          background-color: white !important;
          font-weight: 700 !important;
          color: #083344 !important;
          height: 38px !important;
          display: flex;
          align-items: center;
        }
        .custom-rounded-select .ant-select-selection-placeholder { color: #083344 !important; }
        .custom-rounded-select .ant-select-arrow { color: #0d9488 !important; }
      `}</style>
        </div>
    );
};