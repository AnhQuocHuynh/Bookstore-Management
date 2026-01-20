import React, { useState, useMemo } from "react";
import { Input, Select } from "antd";
import { Search, X } from "lucide-react";
import { useDisplayProducts, useShelves } from "../hooks/useDisplay";
import { useDebounce } from "@/hooks/use-debounce";
import { DisplayProductTable, TableHeader } from "./DisplayProductTable";
import { DisplayProductDetailPanel } from "./DisplayProductDetailPanel";
import { DisplayProduct } from "../types";

const { Option } = Select;

export const DisplayProductsView = () => {
    // --- States ---
    const [searchText, setSearchText] = useState("");
    const [selectedShelfId, setSelectedShelfId] = useState<string | undefined>(undefined);
    const [selectedItem, setSelectedItem] = useState<DisplayProduct | null>(null);

    // Debounce input tìm kiếm (500ms)
    const debouncedSearchText = useDebounce(searchText, 500);

    // --- FIX LOGIC PARAMS THEO API MỚI ---
    const queryParams = useMemo(() => {
        const params: any = {};

        // 1. Map 'searchText' -> 'productName' (Backend yêu cầu)
        if (debouncedSearchText && debouncedSearchText.trim() !== "") {
            params.productName = debouncedSearchText.trim();
        }

        // 2. Map 'selectedShelfId' -> 'displayShelfId' (Backend yêu cầu)
        if (selectedShelfId) {
            params.displayShelfId = selectedShelfId;
        }

        // Mặc định lọc active (nếu cần)
        params.status = 'active';

        return params;
    }, [debouncedSearchText, selectedShelfId]);

    // Gọi Hook lấy dữ liệu
    const { data: products, isLoading } = useDisplayProducts(queryParams);
    const { data: shelves } = useShelves();

    // --- Handlers ---
    const handleRowClick = (record: DisplayProduct) => {
        if (selectedItem?.id === record.id) {
            setSelectedItem(null);
        } else {
            setSelectedItem(record);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">
            {/* --- Filter Bar --- */}
            <div className="flex-shrink-0 px-6 pt-3 pb-2">
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                        <Input
                            prefix={<Search size={16} className="text-gray-400" />}
                            placeholder="Tìm theo Tên sách hoặc Mã SKU..."
                            className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600 h-[38px]"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </div>
                    
                    <Select
                        placeholder="Lọc theo kệ"
                        allowClear
                        className="min-w-[250px]"
                        style={{ height: 38 }}
                        options={shelves?.map((s: any) => ({ label: s.name, value: s.id }))}
                        onChange={setSelectedShelfId}
                        value={selectedShelfId}
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
                            <DisplayProductTable
                                data={products || []}
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
                            <DisplayProductDetailPanel selectedItem={selectedItem} />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};