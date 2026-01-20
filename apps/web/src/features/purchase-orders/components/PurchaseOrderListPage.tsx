import React, { useState } from "react";
import { Button, Input } from "antd";
import { Plus, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrder";
import { useDebounce } from "@/hooks/use-debounce";
import { PurchaseOrderTable, TableHeader } from "./PurchaseOrderTable";
import { PurchaseOrderDetailPanel } from "./PurchaseOrderDetailPanel";
import { PurchaseOrderListItem } from "../types";

export const PurchaseOrderListPage = () => {
    const navigate = useNavigate();

    // --- States ---
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 500);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderListItem | null>(null);

    // --- Data Fetching ---
    const { data: orders, isLoading } = usePurchaseOrders({
        employeeName: debouncedSearch || undefined,
    });

    const isPanelOpen = !!selectedOrder;

    // --- Handlers ---
    const handleRowClick = (record: PurchaseOrderListItem) => {
        if (selectedOrder?.id === record.id) {
            setSelectedOrder(null);
        } else {
            setSelectedOrder(record);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
            {/* --- Header --- */}
            <div className="flex-shrink-0 px-6 pt-3 pb-2">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
                            Danh sách Phiếu Nhập
                        </h1>
                        <Button
                            type="primary"
                            size="large"
                            icon={<Plus size={18} />}
                            className="bg-[#1a998f] hover:bg-[#158f85] font-semibold h-[42px] px-6"
                            onClick={() => navigate("/purchase-orders/create")}
                        >
                            Tạo Phiếu Nhập
                        </Button>
                    </div>

                    {/* --- Filter Bar --- */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                        <div className="relative w-full sm:flex-1 min-w-[200px]">
                            <Input
                                prefix={<Search size={16} className="text-gray-400" />}
                                placeholder="Tìm theo tên nhân viên..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600 h-[38px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
                <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">
                    
                    {/* Table Section */}
                    <div className={`absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10 ${selectedOrder ? "right-[450px]" : "right-[20px]"}`}>
                        <div className="flex-shrink-0">
                            <TableHeader isPanelOpen={isPanelOpen} />
                        </div>

                        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                            <PurchaseOrderTable
                                data={orders || []}
                                loading={isLoading}
                                selectedItem={selectedOrder}
                                onRowClick={handleRowClick}
                                isPanelOpen={isPanelOpen}
                            />
                        </div>
                    </div>

                    {/* Detail Panel */}
                    <div className={`absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f] transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col ${selectedOrder ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}`}>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
                        >
                            <X size={24} />
                        </button>
                        <div className="flex-1 overflow-hidden h-full">
                            <PurchaseOrderDetailPanel orderId={selectedOrder?.id || null} />
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
};