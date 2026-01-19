import React, { useState } from "react";
import { Table, Tag, DatePicker, Select, Button, Spin, Pagination } from "antd";
import { Filter, RotateCcw, X, Truck, ShoppingCart, ArrowRightLeft, AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import { useInventoryLogs } from "../hooks/useInventory";
import { InventoryLogAction, InventoryLogItem } from "../types";
import { InventoryLogDetailPanel } from "./InventoryLogDetailPanel";

const { RangePicker } = DatePicker;

// Helper: Config Action
const getActionConfig = (action: string) => {
    switch (action) {
        case 'purchase': return { color: 'green', label: 'Nhập hàng', icon: <Truck size={14} /> };
        case 'sale': return { color: 'blue', label: 'Bán hàng', icon: <ShoppingCart size={14} /> };
        case 'return': return { color: 'orange', label: 'Trả hàng', icon: <ArrowRightLeft size={14} /> };
        case 'adjustment': return { color: 'red', label: 'Điều chỉnh', icon: <AlertTriangle size={14} /> };
        default: return { color: 'default', label: action, icon: null };
    }
};

// --- TABLE HEADER COMPONENT ---
const TableHeader: React.FC<{ isPanelOpen: boolean }> = ({ isPanelOpen }) => (
    <div className="h-12 bg-[#1a998f] rounded-t-[20px] flex items-center px-3 w-full text-white font-bold text-sm">
        <div className="w-12 text-center">STT</div>
        <div className="w-32 pl-2">Thời gian</div>
        <div className="w-32 text-center">Hành động</div>
        <div className="flex-1 pl-4">Sản phẩm</div>
        <div className="w-24 text-right pr-4">Thay đổi</div>
        {!isPanelOpen && <div className="w-32 pl-4">Nhân viên</div>}
    </div>
);

// --- MAIN PAGE COMPONENT ---
export const InventoryLogsPage = () => {
    // --- States ---
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [action, setAction] = useState<InventoryLogAction | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    // State quản lý Panel
    const [selectedLog, setSelectedLog] = useState<InventoryLogItem | null>(null);

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

    // --- Handlers ---
    const handleRowClick = (record: InventoryLogItem) => {
        if (selectedLog?.id === record.id) {
            setSelectedLog(null);
        } else {
            setSelectedLog(record);
        }
    };

    const handleReset = () => {
        setAction(undefined);
        setDateRange(null);
        setPage(1);
    };

    const isPanelOpen = !!selectedLog;

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
            {/* --- HEADER & FILTER --- */}
            <div className="flex-shrink-0 px-6 pt-3 pb-2">
                <div className="flex flex-col gap-4">
                    {/* Title & Reset Btn */}
                    <div className="flex justify-between items-center">
                        <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">Lịch sử Kho</h1>
                        <Button icon={<RotateCcw size={14} />} onClick={handleReset} type="text" className="text-gray-500">
                            Đặt lại
                        </Button>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                        <div className="flex items-center gap-2 mr-2">
                            <Filter size={18} className="text-teal-600" />
                            <span className="font-semibold text-gray-700 text-sm hidden sm:inline">Bộ lọc:</span>
                        </div>

                        <Select
                            placeholder="Loại hành động"
                            style={{ width: 160, height: 38 }}
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
                            className="h-[38px] w-full sm:w-auto"
                        />
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT (Table + Panel) --- */}
            <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
                <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">

                    {/* LEFT SECTION: TABLE */}
                    <div className={`
                absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10
                ${selectedLog ? "right-[450px]" : "right-[20px]"}
            `}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={isPanelOpen} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full"><Spin size="large" /></div>
                            ) : (
                                <div className="w-full">
                                    {logs.map((item, index) => {
                                        const actionConf = getActionConfig(item.action);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleRowClick(item)}
                                                className={`
                                            flex items-center px-3 h-14 border-b border-gray-100 cursor-pointer transition-colors text-sm text-[#102e3c]
                                            ${selectedLog?.id === item.id ? "bg-[#1a998f]/20 border-l-4 border-l-[#1a998f] pl-[8px]" : "hover:bg-gray-50"}
                                        `}
                                            >
                                                <div className="w-12 text-center font-medium text-gray-500">{(page - 1) * limit + index + 1}</div>
                                                <div className="w-32 pl-2 text-gray-600">
                                                    <div className="font-medium">{dayjs(item.createdAt).format("DD/MM/YYYY")}</div>
                                                    <div className="text-xs text-gray-400">{dayjs(item.createdAt).format("HH:mm")}</div>
                                                </div>
                                                <div className="w-32 text-center">
                                                    <Tag color={actionConf.color} className="m-0 inline-flex items-center gap-1">
                                                        {actionConf.icon} {actionConf.label}
                                                    </Tag>
                                                </div>
                                                <div className="flex-1 pl-4 min-w-0">
                                                    <div className="font-semibold text-[#102e3c] truncate" title={item.inventory?.product?.name}>
                                                        {item.inventory?.product?.name || "Sản phẩm đã xóa"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {item.inventory?.product?.sku || "N/A"}
                                                    </div>
                                                </div>
                                                <div className="w-24 text-right pr-4 font-bold">
                                                    <span className={item.quantityChange > 0 ? "text-green-600" : "text-red-600"}>
                                                        {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
                                                    </span>
                                                </div>
                                                {!isPanelOpen && (
                                                    <div className="w-32 pl-4 truncate text-gray-600" title={item.employee?.fullName}>
                                                        {item.employee?.fullName || "Hệ thống"}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {logs.length === 0 && (
                                        <div className="p-10 text-center text-gray-400">Không có dữ liệu biến động kho</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* PAGINATION */}
                        <div className="p-3 border-t border-gray-200 bg-white flex justify-end flex-shrink-0">
                            <Pagination
                                current={page}
                                pageSize={limit}
                                total={total}
                                onChange={(p, s) => { setPage(p); setLimit(s); }}
                                size="small"
                                showTotal={(total) => `Tổng ${total}`}
                            />
                        </div>
                    </div>

                    {/* RIGHT SECTION: DETAIL PANEL */}
                    <div className={`
                absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
                transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
                ${selectedLog ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
            `}>
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>
                        <div className="flex-1 overflow-hidden h-full">
                            <InventoryLogDetailPanel selectedItem={selectedLog} />
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
};