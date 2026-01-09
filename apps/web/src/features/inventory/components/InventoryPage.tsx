import React, { useState, useMemo } from "react";
import { message, Spin, Select, Input } from "antd"; // Import thêm các component UI
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

import { ActionButton } from "./ActionButton";
import { InventoryTable, TableHeader } from "./InventoryTable";
import { InventoryDetailPanel } from "./InventoryDetailPanel";
import { SorterButton } from "./SorterButton";
import { InventoryAddPanel } from "./InventoryAddPanel";
import { InventoryEditPanel } from "./InventoryEditPanel";

// Import Hooks & Types mới
import { useInventory, useCategories, useSuppliersList } from "../hooks/useInventory";
import { InventoryItem } from "../types";

const { Option } = Select;

export const InventoryPage = () => {
  // --- State quản lý Filter ---
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500); // Tránh gọi API liên tục khi gõ
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // --- State quản lý UI khác ---
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // --- Fetch Data ---
  // 1. Lấy Categories
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data?.data || []; // Tuỳ cấu trúc response mà điều chỉnh .data.data

  // 2. Lấy Suppliers
  const { data: suppliersData } = useSuppliersList();
  const suppliers = Array.isArray(suppliersData?.data) ? suppliersData?.data : [];

  // 3. Lấy Products (Inventory)
  const { data: productsData, isLoading, isError } = useInventory({
    keyword: debouncedKeyword,
    // Lưu ý: API categoryName lọc tương đối, categorySlug lọc chính xác. 
    // Ở đây giả sử select trả về ID hoặc Name tuỳ bạn muốn gửi gì lên
    // Nếu API categoryName là string, ta gửi text.
    categoryName: selectedCategory,
    supplierName: selectedSupplier,
    type: selectedType,
    sortBy,
    sortOrder,
    isActive: true, // Mặc định chỉ lấy hàng đang kinh doanh
  });

  // --- Transform Data (Mapping API response -> Table format) ---
  const tableData = useMemo(() => {
    const rawData = Array.isArray(productsData?.data) ? productsData?.data : [];

    return rawData.map((item: any) => ({
      ...item,
      key: item.id,
      // Map các trường lồng nhau ra ngoài để hiển thị trên Table
      purchasePrice: item.inventory?.costPrice || 0,
      sellingPrice: item.price,
      stock: item.inventory?.stockQuantity || 0,
      profit: (item.price || 0) - (item.inventory?.costPrice || 0),
      supplier: item.supplier?.name || "--",
      category: item.categories?.[0]?.name || "--", // Lấy danh mục đầu tiên
      image: item.imageUrl || "", // Map imageUrl -> image
    }));
  }, [productsData]);

  // --- Handlers ---
  const handleSortChange = (key: string, order: 'asc' | 'desc') => {
    // Map key từ frontend sang key backend (nếu cần)
    // Ví dụ: frontend 'stock' -> backend có thể cần sort theo field khác hoặc backend tự xử lý
    setSortBy(key);
    setSortOrder(order);
  };

  const handleRowClick = (record: InventoryItem) => {
    setSelectedItem(record);
  };

  // ... Giữ lại các hàm handleAdd, handleEdit, handleDelete cũ nhưng cần cập nhật logic gọi API thật (để sau) ...

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">

      {/* --- Header Section --- */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">
              Danh Sách Sản Phẩm
            </h1>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Sort Button giữ nguyên component cũ */}
              <SorterButton onSortChange={handleSortChange} currentSort={sortBy} currentSortOrder={sortOrder} />

              <ActionButton label="Xóa" variant="outlined" onClick={() => message.info("Chức năng đang cập nhật")} />
              <ActionButton label="Sửa" variant="outlined" onClick={() => setIsEditPanelOpen(true)} />
              <ActionButton label="Tạo Mới" variant="filled" onClick={() => setIsAddPanelOpen(true)} />
            </div>
          </div>

          {/* --- FILTER BAR (Mới) --- */}
          <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">

            {/* 1. Tìm kiếm */}
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Tìm tên, SKU..."
                prefix={<Search size={16} className="text-gray-400" />}
                className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600"
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* 2. Lọc theo Loại (Type) */}
            <Select
              placeholder="Loại sản phẩm"
              allowClear
              className="min-w-[160px]"
              onChange={setSelectedType}
              style={{ height: 38 }}
            >
              <Option value="book">Sách</Option>
              <Option value="stationery">Văn phòng phẩm</Option>
              <Option value="other">Khác</Option>
            </Select>

            {/* 3. Lọc theo Danh mục (Gọi API) */}
            <Select
              placeholder="Danh mục"
              allowClear
              showSearch
              className="min-w-[180px]"
              onChange={setSelectedCategory}
              optionFilterProp="children"
              style={{ height: 38 }}
              loading={!categoriesData}
            >
              {categories.map((cat: any) => (
                // Lưu ý: API filter đang dùng categoryName, nếu sửa API dùng ID thì đổi value={cat.id}
                <Option key={cat.id} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>

            {/* 4. Lọc theo Nhà cung cấp (Gọi API) */}
            <Select
              placeholder="Nhà cung cấp"
              allowClear
              showSearch
              className="min-w-[200px]"
              onChange={setSelectedSupplier}
              optionFilterProp="children"
              style={{ height: 38 }}
              loading={!suppliersData}
            >
              {suppliers.map((sup: any) => (
                <Option key={sup.id} value={sup.name}>{sup.name}</Option>
              ))}
            </Select>

          </div>
        </div>
      </div>

      {/* --- Main Content (Table) --- */}
      <main className="flex-1 px-6 pb-6 overflow-hidden mt-4">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">

          {/* Table Header Component giữ nguyên */}
          <div className="flex-shrink-0">
            <TableHeader />
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto relative">
            {isError ? (
              <div className="flex justify-center items-center h-full text-red-500">
                Có lỗi xảy ra khi tải dữ liệu.
              </div>
            ) : (
              <InventoryTable
                data={tableData} // Dữ liệu đã map
                loading={isLoading}
                selectedItem={selectedItem}
                onRowClick={handleRowClick}
              />
            )}
          </div>

          {/* Detail Panel */}
          <InventoryDetailPanel selectedItem={selectedItem} />
        </section>
      </main>

      {/* Các Modal Add/Edit (Cần cập nhật logic submit sau) */}
      <InventoryAddPanel
        isOpen={isAddPanelOpen}
        category={null} // Tạm thời để null hoặc xử lý logic form sau
        onClose={() => setIsAddPanelOpen(false)}
        onSubmit={(data) => console.log("Create Data:", data)}
      />
      <InventoryEditPanel
        isOpen={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        onSubmit={(data) => console.log("Update Data:", data)}
        initialData={selectedItem as any}
      />
    </div>
  );
};