import React, { useState, useMemo } from "react";
import { message, Input, Button } from "antd";
import { Search, Plus, X } from "lucide-react"; // Import thêm icon X
import { useDebounce } from "@/hooks/use-debounce";

import { TableHeader, SupplierTable } from "./SupplierTable";
import { SupplierDetailPanel } from "./SupplierDetailPanel"; // Import Panel mới
import { useSuppliers } from "../hooks/useSuppliers";
import { Supplier, SupplierTableRow } from "../types";

export const SuppliersPage = () => {
  // --- States ---
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierTableRow | null>(null);

  // --- Fetching ---
  const { data: responseData, isLoading, isError } = useSuppliers();
  const suppliersList = Array.isArray(responseData) ? responseData : (Array.isArray(responseData?.data) ? responseData?.data : []);

  // --- Transform & Filter ---
  const tableData: SupplierTableRow[] = useMemo(() => {
    let data = suppliersList.map((item: Supplier) => ({
      ...item,
      key: item.id,
    }));

    if (debouncedKeyword) {
      const lowerKeyword = debouncedKeyword.toLowerCase();
      data = data.filter((item: Supplier) =>
        (item.name && item.name.toLowerCase().includes(lowerKeyword)) ||
        (item.supplierCode && item.supplierCode.toLowerCase().includes(lowerKeyword)) ||
        (item.phoneNumber && item.phoneNumber.includes(lowerKeyword)) ||
        (item.email && item.email.toLowerCase().includes(lowerKeyword))
      );
    }
    return data;
  }, [suppliersList, debouncedKeyword]);

  // --- Handlers ---
  const handleRowClick = (record: SupplierTableRow) => {
    if (selectedSupplier?.key === record.key) {
      setSelectedSupplier(null);
    } else {
      setSelectedSupplier(record);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">

      {/* --- Header --- */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
              Nhà Cung Cấp
            </h1>
            <div className="flex items-center gap-2.5">
              <Button
                type="primary"
                icon={<Plus size={18} />}
                className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-4 rounded-xl font-bold border-none"
                onClick={() => message.info("Chức năng tạo mới đang phát triển")}
              >
                Tạo Mới
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Tìm tên, mã, SĐT, email..."
                prefix={<Search size={16} className="text-gray-400" />}
                className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600 h-[38px]"
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content (Layout Sliding) --- */}
      <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">

          {/* 1. TABLE CONTAINER: Co giãn khi mở panel */}
          <div
            className={`
              absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10
              ${selectedSupplier ? "right-[450px]" : "right-[20px]"}
            `}
          >
            <div className="flex-shrink-0">
              {/* Truyền isPanelOpen vào Header */}
              <TableHeader isPanelOpen={!!selectedSupplier} />
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
              {isError ? (
                <div className="flex justify-center items-center h-full text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
              ) : (
                <SupplierTable
                  data={tableData}
                  loading={isLoading}
                  onRowClick={handleRowClick}
                  selectedId={selectedSupplier?.id}
                  isPanelOpen={!!selectedSupplier} // Truyền isPanelOpen vào Table
                />
              )}
            </div>
          </div>

          {/* 2. DETAIL PANEL: Trượt từ phải sang */}
          <div
            className={`
              absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f]
              transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col
              ${selectedSupplier ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}
            `}
          >
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedSupplier(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Nội dung Panel */}
            <div className="flex-1 overflow-hidden h-full">
              <SupplierDetailPanel selectedItem={selectedSupplier} />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};