import React, { useState } from "react";
import { DatePicker, Select, Button } from "antd";
import { Search, RotateCcw, X } from "lucide-react";
import { useDisplayLogs } from "../hooks/useDisplay";
import dayjs from "dayjs";
import { DisplayLogTable, TableHeader } from "./DisplayLogTable";
import { DisplayLogDetailPanel } from "./DisplayLogDetailPanel";
import { DisplayLog } from "../types";

const { RangePicker } = DatePicker;

export const DisplayLogsView = () => {
    // --- STATE ---
    const [action, setAction] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<any>(null);
    const [selectedItem, setSelectedItem] = useState<DisplayLog | null>(null);

    // Tạo params gửi đi
    const params = {
        action,
        from: dateRange ? dayjs(dateRange[0]).format('YYYY-MM-DD') : undefined,
        to: dateRange ? dayjs(dateRange[1]).format('YYYY-MM-DD') : undefined,
    };

    const { data: logs, isLoading, refetch } = useDisplayLogs(params);

    // --- Handlers ---
    const handleRowClick = (record: DisplayLog) => {
        if (selectedItem?.id === record.id) {
            setSelectedItem(null);
        } else {
            setSelectedItem(record);
        }
    };

    const handleReset = () => {
        setAction(undefined);
        setDateRange(null);
    };

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
            {/* --- Filter Bar --- */}
            <div className="flex-shrink-0 px-6 pt-3 pb-2">
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                    <Select
                        placeholder="Hành động"
                        allowClear
                        className="w-[160px]"
                        style={{ height: 38 }}
                        options={[
                            { label: 'Thêm hàng', value: 'add' },
                            { label: 'Di chuyển', value: 'move' },
                            { label: 'Trả về kho', value: 'return_to_inventory' },
                            { label: 'Gỡ khỏi kệ', value: 'remove' },
                            { label: 'Điều chỉnh', value: 'adjust' },
                        ]}
                        value={action}
                        onChange={setAction}
                    />

                    <RangePicker
                        placeholder={['Từ ngày', 'Đến ngày']}
                        className="w-[280px]"
                        style={{ height: 38 }}
                        onChange={setDateRange}
                        value={dateRange}
                    />

                    <Button
                        icon={<Search size={16} />}
                        type="primary"
                        onClick={() => refetch()}
                        className="bg-[#1a998f] h-[38px]"
                    >
                        Lọc
                    </Button>

                    <Button
                        icon={<RotateCcw size={16} />}
                        onClick={handleReset}
                        title="Đặt lại bộ lọc"
                        className="h-[38px]"
                    />
                </div>
            </div>

            {/* --- Main Content --- */}
            <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
                <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">
                    
                    <div className={`
                        absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10
                        ${selectedItem ? "right-[450px]" : "right-[20px]"}
                    `}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={!!selectedItem} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            <DisplayLogTable
                                data={logs || []}
                                loading={isLoading}
                                selectedItem={selectedItem}
                                onRowClick={handleRowClick}
                                isPanelOpen={!!selectedItem}
                            />
                        </div>
                    </div>

                    {/* DETAIL PANEL */}
                    <div className={`
                        absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
                        transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
                        ${selectedItem ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
                    `}>
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1 overflow-hidden h-full">
                            <DisplayLogDetailPanel selectedItem={selectedItem} />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};