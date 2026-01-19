import React, { useState, useMemo } from "react";
import { message, Select, Input, Modal, Button } from "antd";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { InventoryTable, TableHeader } from "./InventoryTable";
import { InventoryDetailPanel } from "./InventoryDetailPanel";
import { SorterButton } from "./SorterButton";
import { InventoryEditPanel } from "./InventoryEditPanel";
import { useAuthStore } from "@/stores/useAuthStore";

import {
  useInventory,
  useCategories,
  useSuppliersList,
  useDeleteProduct,
  useUpdateProduct
} from "../hooks/useInventory";

import { InventoryItem, InventoryTableRow, InventoryFormData } from "../types";

const { Option } = Select;

export const InventoryPage = () => {
  const userRole = (useAuthStore((s) => s.user?.role) as "OWNER" | "EMPLOYEE" | "ADMIN" | undefined) || "EMPLOYEE";
  // --- States ---
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [activeCategory, setActiveCategory] = useState<"Sách" | "Văn phòng phẩm">("Sách");
  const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedItem, setSelectedItem] = useState<InventoryTableRow | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // --- Fetching ---
  const { data: suppliersData } = useSuppliersList();
  const suppliers = Array.isArray(suppliersData?.data) ? suppliersData?.data : [];

  // Map category to type
  const typeFilter = activeCategory === "Sách" ? "book" : "stationery";

  const { data: productsData, isLoading, isError } = useInventory({
    keyword: debouncedKeyword,
    categoryName: undefined,
    supplierName: selectedSupplier,
    type: typeFilter,
    sortBy,
    sortOrder,
    isActive: undefined,
  });

  // --- Mutations ---
  const deleteMutation = useDeleteProduct();
  const updateMutation = useUpdateProduct();

  // --- Transform Data (API -> Table UI) ---
  const tableData: InventoryTableRow[] = useMemo(() => {
    const rawData = Array.isArray(productsData?.data) ? productsData?.data : [];

    return rawData.map((item: InventoryItem) => ({
      key: item.id,
      id: item.id,
      sku: item.sku,
      name: item.name,
      image: item.imageUrl || "",

      purchasePrice: item.inventory?.costPrice || 0,
      sellingPrice: item.price,
      stock: item.inventory?.stockQuantity || 0,
      profit: (item.price || 0) - (item.inventory?.costPrice || 0),

      supplier: item.supplier?.name || "--",
      category: item.categories?.[0]?.name || "--",
      type: item.type,

      description: item.description || "",
      // Fix lỗi: Giờ InventoryTableRow đã có isActive
      isActive: item.isActive,

      author: item.book?.author,
      publisher: item.book?.publisher,
      releaseYear: item.book?.publicationYear,
      releaseVersion: item.book?.releaseVersion,
      language: item.book?.language,

      createdDate: item.createdAt,
      updateDate: item.updatedAt,
    }));
  }, [productsData]);

  // --- Transform Data (Table UI -> Edit Form) ---
  const selectedFormData: InventoryFormData | undefined = selectedItem ? {
    sku: selectedItem.sku,
    name: selectedItem.name,
    image: selectedItem.image,
    purchasePrice: selectedItem.purchasePrice,
    sellingPrice: selectedItem.sellingPrice,
    isActive: selectedItem.isActive ?? true,
    description: selectedItem.description,

    // Các trường optional
    stock: selectedItem.stock,
    category: selectedItem.category,
    type: selectedItem.type,
    supplier: selectedItem.supplier,
    author: selectedItem.author,
    publisher: selectedItem.publisher,
    releaseYear: selectedItem.releaseYear,
    releaseVersion: selectedItem.releaseVersion,
    language: selectedItem.language,
  } : undefined;

  // --- Handlers ---
  const handleSortChange = (key: string, order: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(order);
  };

  const handleRowClick = (record: InventoryTableRow) => {
    if (selectedItem?.key === record.key) {
      setSelectedItem(null);
    } else {
      setSelectedItem(record);
    }
  };

  const handleDelete = () => {
    if (!selectedItem) {
      message.warning("Vui lòng chọn sản phẩm cần xóa");
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${selectedItem.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deleteMutation.mutate(selectedItem.id, {
          onSuccess: () => {
            setSelectedItem(null);
          }
        });
      },
    });
  };

  const handleUpdate = (formData: InventoryFormData) => {
    if (!selectedItem) return;

    // Map dữ liệu từ Form (sellingPrice) -> API (price)
    const updatePayload = {
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      price: formData.sellingPrice, // Đổi tên cho đúng API
      imageUrl: formData.image,
      isActive: formData.isActive,
    };

    updateMutation.mutate({
      id: selectedItem.id,
      data: updatePayload
    }, {
      onSuccess: () => {
        setIsEditPanelOpen(false);
        // Cập nhật lại UI tạm thời
        setSelectedItem((prev) => prev ? ({
          ...prev,
          name: formData.name,
          sku: formData.sku,
          image: formData.image || "",
          sellingPrice: formData.sellingPrice,
          description: formData.description,
          isActive: formData.isActive,
        }) : null);
      }
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-['Inter']">

      {/* --- Header --- */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl">Tồn Kho</h1>
            <div className="flex items-center gap-2.5 flex-wrap">
              <SorterButton onSortChange={handleSortChange} currentSort={sortBy} currentSortOrder={sortOrder} />
              {userRole !== "OWNER" && (
                <>
                  <Button 
                    onClick={handleDelete} 
                    danger 
                    disabled={!selectedItem} 
                    className="h-10 rounded-xl font-semibold"
                  >
                    Xóa
                  </Button>

                  <Button 
                    onClick={() => selectedItem ? setIsEditPanelOpen(true) : message.warning("Vui lòng chọn sản phẩm")} 
                    disabled={!selectedItem} 
                    className="h-10 rounded-xl font-semibold border-teal-600 text-teal-700"
                  >
                    Sửa
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* --- Filter Bar --- */}
          <div className="flex flex-wrap items-center gap-3 mt-2 bg-white p-3 rounded-xl border border-[#102e3c]/10 shadow-sm">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveCategory("Sách")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  activeCategory === "Sách"
                    ? "bg-[#1a998f] text-white"
                    : "bg-transparent text-[#102e3c] hover:bg-gray-200"
                }`}
              >
                Sách
              </button>
              <button
                onClick={() => setActiveCategory("Văn phòng phẩm")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  activeCategory === "Văn phòng phẩm"
                    ? "bg-[#1a998f] text-white"
                    : "bg-transparent text-[#102e3c] hover:bg-gray-200"
                }`}
              >
                Văn phòng phẩm
              </button>
            </div>

            <div className="relative w-full sm:flex-1 min-w-[200px]">
              <Input
                placeholder="Tìm tên, SKU..."
                prefix={<Search size={16} className="text-gray-400" />}
                className="rounded-lg border-teal-600/30 hover:border-teal-600 focus:border-teal-600 h-[38px]"
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <Select placeholder="Nhà cung cấp" allowClear showSearch className="min-w-[200px]" onChange={setSelectedSupplier} style={{ height: 38 }} loading={!suppliersData}>
              {suppliers.map((sup: any) => <Option key={sup.id} value={sup.name}>{sup.name}</Option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="flex-1 px-6 pb-6 overflow-hidden mt-4 relative">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-sm flex flex-col">

          <div className={`absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col bg-white z-10 ${selectedItem ? "right-[450px]" : "right-[20px]"}`}>
            <div className="flex-shrink-0">
              <TableHeader isPanelOpen={!!selectedItem} />
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
              {isError ? (
                <div className="flex justify-center items-center h-full text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
              ) : (
                <InventoryTable
                  data={tableData}
                  loading={isLoading}
                  selectedItem={selectedItem}
                  onRowClick={handleRowClick}
                  isPanelOpen={!!selectedItem}
                />
              )}
            </div>
          </div>

          <div className={`absolute top-3 bottom-3 w-[430px] bg-white rounded-[20px] border-[3px] border-[#1a998f] transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden flex flex-col ${selectedItem ? "right-3 translate-x-0 opacity-100" : "right-3 translate-x-[110%] opacity-0 pointer-events-none"}`}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors z-50 cursor-pointer">
              <X size={24} />
            </button>
            <div className="flex-1 overflow-hidden h-full">
              <InventoryDetailPanel selectedItem={selectedItem} />
            </div>
          </div>

        </section>
      </main>

      {/* --- Modals --- */}
      {userRole !== "OWNER" && (
        <InventoryEditPanel
          isOpen={isEditPanelOpen}
          onClose={() => setIsEditPanelOpen(false)}
          onSubmit={handleUpdate}
          initialData={selectedFormData}
        />
      )}
    </div>
  );
};