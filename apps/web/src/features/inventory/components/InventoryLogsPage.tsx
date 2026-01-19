// file: components/InventoryLogsPage.tsx
import React, { useState } from "react";
import { Table, Tag, DatePicker, Select, Button, Pagination, Spin, Card } from "antd";
import { Filter, RotateCcw, ArrowRightLeft, ShoppingCart, Truck, AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import { useInventoryLogs } from "../hooks/useInventory";
import { InventoryLogAction } from "../types";
import { formatCurrency } from "@/utils";

const { RangePicker } = DatePicker;

// Helper: Màu sắc & Icon cho Action
const getActionConfig = (action: string) => {
    switch (action) {
        case 'purchase': return { color: 'green', label: 'Nhập hàng', icon: <Truck size={14} /> };
        case 'sale': return { color: 'blue', label: 'Bán hàng', icon: <ShoppingCart size={14} /> };
        case 'return': return { color: 'orange', label: 'Trả hàng', icon: <ArrowRightLeft size={14} /> };
        case 'adjustment': return { color: 'red', label: 'Điều chỉnh', icon: <AlertTriangle size={14} /> };
        default: return { color: 'default', label: action, icon: null };
    }
};

export const InventoryLogsPage = () => {
    // --- States ---
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [action, setAction] = useState<InventoryLogAction | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    // --- API ---
    const queryParams = {
        page,
        limit,
        action,
        fromDate: dateRange?.[0]?.format("YYYY-MM-DD"),
        toDate: dateRange?.[1]?.format("YYYY-MM-DD"),
    };

    const { data, isLoading } = useInventoryLogs(queryParams);
    const logs = data?.data || [];
    const total = data?.total || 0;

    // --- Columns ---
    const columns = [
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            width: 160,
            render: (date: string) => (
                <div className="text-gray-600">
                    <div className="font-medium">{dayjs(date).format("DD/MM/YYYY")}</div>
                    <div className="text-xs">{dayjs(date).format("HH:mm")}</div>
                </div>
            )
        },
        {
            title: "Hành động",
            dataIndex: "action",
            width: 140,
            render: (act: string) => {
                const config = getActionConfig(act);
                return (
                    <Tag color={config.color} className="flex items-center gap-1 w-fit px-2 py-1">
                        {config.icon} {config.label}
                    </Tag>
                );
            }
        },
        {
            title: "Thay đổi",
            dataIndex: "quantityChange",
            width: 120,
            align: 'right' as const,
            render: (qty: number) => (
                <span className={`font-bold ${qty > 0 ? "text-green-600" : "text-red-600"}`}>
                    {qty > 0 ? `+${qty}` : qty}
                </span>
            )
        },
        {
            title: "Ghi chú / Sản phẩm",
            dataIndex: "note",
            render: (note: string, record: any) => (
                <div>
                    {/* Nếu có thông tin sản phẩm từ relation inventory.product thì hiện ở đây */}
                    {record.inventory?.product && (
                        <div className="font-semibold text-[#102e3c] mb-1">
                            [{record.inventory.product.sku}] {record.inventory.product.name}
                        </div>
                    )}
                    <div className="text-gray-500 italic text-sm">{note || "--"}</div>
                </div>
            )
        },
        {
            title: "Nhân viên",
            dataIndex: ["employee", "fullName"],
            width: 180,
            render: (name: string) => name || <span className="text-gray-400">Hệ thống</span>
        }
    ];

    // --- Handlers ---
    const handleReset = () => {
        setAction(undefined);
        setDateRange(null);
        setPage(1);
    };

    return (
        <div className="p-6 h-full flex flex-col font-['Inter'] bg-[#f8fafc]">
            {/* HEADER */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-[#102e3c]">Lịch sử Biến động Kho</h1>
                    <Button icon={<RotateCcw size={14} />} onClick={handleReset} type="text">
                        Đặt lại bộ lọc
                    </Button>
                </div>

                {/* FILTER BAR */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-teal-600" />
                        <span className="font-semibold text-gray-700">Bộ lọc:</span>
                    </div>

                    <Select
                        placeholder="Loại hành động"
                        style={{ width: 180 }}
                        allowClear
                        value={action}
                        onChange={(val) => { setAction(val); setPage(1); }}
                        options={[
                            { value: 'purchase', label: 'Nhập hàng' },
                            { value: 'sale', label: 'Bán hàng' },
                            { value: 'return', label: 'Trả hàng' },
                            { value: 'adjustment', label: 'Điều chỉnh' },
                        ]}
                    />

                    <RangePicker
                        placeholder={['Từ ngày', 'Đến ngày']}
                        value={dateRange}
                        onChange={(val) => { setDateRange(val); setPage(1); }}
                        format="DD/MM/YYYY"
                    />
                </div>
            </div>

            {/* TABLE CONTENT */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <Table
                        columns={columns}
                        dataSource={logs}
                        rowKey="id"
                        pagination={false}
                        loading={{ indicator: <Spin size="large" />, spinning: isLoading }}
                        rowClassName="hover:bg-gray-50 transition-colors"
                    />
                </div>

                {/* PAGINATION */}
                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <Pagination
                        current={page}
                        pageSize={limit}
                        total={total}
                        onChange={(p, s) => { setPage(p); setLimit(s); }}
                        showSizeChanger
                        showTotal={(total) => `Tổng ${total} bản ghi`}
                    />
                </div>
            </div>
        </div>
    );
};