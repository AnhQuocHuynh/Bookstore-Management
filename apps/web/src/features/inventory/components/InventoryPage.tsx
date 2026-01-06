import React, { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { message, Modal } from "antd";
import { ActionButton } from "./ActionButton";
import { InventoryTable, TableHeader } from "./InventoryTable";
import { InventoryDetailPanel } from "./InventoryDetailPanel";
import { SorterButton } from "./SorterButton";
import { InventoryAddPanel } from "./InventoryAddPanel";
import { InventoryEditPanel } from "./InventoryEditPanel";
import { VPPMockData } from "./mockData";
import { InventoryFormData, InventoryItem } from "../types";

export const InventoryPage = () => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [addPanelCategory, setAddPanelCategory] = useState<"Văn phòng phẩm" | "Sách" | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<"Văn phòng phẩm" | "Sách">("Văn phòng phẩm");
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get("/inventory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.data?.data) {
          const inventoryList = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];

          const formatted = inventoryList.map((item: any, index: number) => ({
            key: item.id || index,
            id: item.id,
            sku: item.sku || item.code || "N/A",
            image: item.image || "",
            name: item.name || "N/A",
            purchasePrice: typeof item.purchasePrice === "number" ? item.purchasePrice : 0,
            sellingPrice: typeof item.sellingPrice === "number" ? item.sellingPrice : 0,
            profit: typeof item.profit === "number" ? item.profit : (item.sellingPrice || 0) - (item.purchasePrice || 0),
            stock: typeof item.stock === "number" ? item.stock : 0,
            category: item.category || item.type || "N/A",
            supplier: item.supplier || item.supplierName || "--",
            description: item.description || "",
            createdDate: item.createdAt || "N/A",
            updateDate: item.updatedAt || "N/A",
          }));

          setData(formatted);
          setLoading(false);
          return;
        }

        setTimeout(() => {
          const sortedData = sortInventory(VPPMockData, sortBy, sortOrder);
          setData(sortedData);
          setLoading(false);
        }, 500);
      } catch (error) {
        message.error("Không thể tải danh sách hàng hóa");
        setTimeout(() => {
          const sortedData = sortInventory(VPPMockData, sortBy, sortOrder);
          setData(sortedData);
          setLoading(false);
        }, 400);
      }
    };

    fetchInventory();
  }, [sortBy, sortOrder]);

  const handleRowClick = (record: InventoryItem) => {
    setSelectedItem(record);
  };

  const handleAddItem = (formData: InventoryFormData) => {
    const profit = formData.sellingPrice - formData.purchasePrice;
    const newItem: InventoryItem = {
      key: Math.max(...data.map((s) => s.key), 0) + 1,
      sku: formData.sku,
      image: formData.image,
      name: formData.name,
      purchasePrice: formData.purchasePrice,
      sellingPrice: formData.sellingPrice,
      profit: profit,
      stock: formData.stock,
      category: formData.category,
      supplier: formData.supplier,
      description: formData.description,
      createdDate: new Date().toLocaleDateString("vi-VN"),
      updateDate: new Date().toLocaleDateString("vi-VN"),
    };

    setData((prev) => [newItem, ...prev]);
    setIsAddPanelOpen(false);
  };

  const handleEditClick = () => {
    if (!selectedItem) {
      message.warning("Bạn chưa chọn hàng hóa");
      return;
    }
    setIsEditPanelOpen(true);
  };

  const handleEditItem = (formData: InventoryFormData) => {
    if (!selectedItem) return;

    const profit = formData.sellingPrice - formData.purchasePrice;
    setData((prev) =>
      prev.map((item) =>
        item.key === selectedItem.key
          ? {
              ...item,
              sku: formData.sku,
              image: formData.image,
              name: formData.name,
              purchasePrice: formData.purchasePrice,
              sellingPrice: formData.sellingPrice,
              profit: profit,
              stock: formData.stock,
              category: formData.category,
              supplier: formData.supplier,
              description: formData.description,
              updateDate: new Date().toLocaleDateString("vi-VN"),
            }
          : item,
      ),
    );
    setIsEditPanelOpen(false);
  };

  const handleDeleteClick = () => {
    if (!selectedItem) {
      message.warning("Bạn chưa chọn hàng hóa");
      return;
    }

    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa hàng hóa?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setData((prev) => prev.filter((s) => s.key !== selectedItem.key));
        setSelectedItem(null);
        message.success("Đã xóa hàng hóa thành công");
      },
    });
  };

  const sortInventory = (
    items: InventoryItem[],
    sortKey: string,
    order: 'asc' | 'desc' = 'asc',
  ): InventoryItem[] => {
    const sorted = [...items].sort((a, b) => {
      let result = 0;
      
      if (sortKey === "stock") {
        result = a.stock - b.stock;
      } else if (sortKey === "sellingPrice") {
        result = a.sellingPrice - b.sellingPrice;
      } else {
        let aValue = "";
        let bValue = "";

        if (sortKey === "name") {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortKey === "category") {
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
        } else if (sortKey === "sku") {
          aValue = a.sku.toLowerCase();
          bValue = b.sku.toLowerCase();
        }

        result = aValue.localeCompare(bValue, "vi");
      }

      return order === 'desc' ? -result : result;
    });

    return sorted;
  };

  const handleSortChange = (sortKey: string, order: 'asc' | 'desc') => {
    setSortBy(sortKey);
    setSortOrder(order);
    const sortedData = sortInventory(data, sortKey, order);
    setData(sortedData);
  };

  const checkScrollNeeded = () => {
    const rowHeight = 48;
    const maxVisibleRows = Math.floor((window.innerHeight - 200) / rowHeight);
    setNeedsScroll(data.length > maxVisibleRows);
  };

  useEffect(() => {
    checkScrollNeeded();
    window.addEventListener("resize", checkScrollNeeded);
    return () => window.removeEventListener("resize", checkScrollNeeded);
  }, [data]);

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    setScrollTop(currentScrollTop);

    const proportion = clientHeight / scrollHeight;
    const trackHeight = target.clientHeight - 24;
    const calculatedThumbHeight = Math.max(proportion * trackHeight, 40);
    setThumbHeight(calculatedThumbHeight);
  };

  const handleThumbMouseDown = () => {
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!tableContainerRef.current || !scrollbarTrackRef.current) return;

      const track = scrollbarTrackRef.current;
      const table = tableContainerRef.current;

      const trackRect = track.getBoundingClientRect();
      const thumb = Math.max(
        (table.clientHeight / table.scrollHeight) * (table.clientHeight - 24),
        40,
      );
      const trackHeight = track.clientHeight;

      let newTop = e.clientY - trackRect.top - thumb / 2;
      newTop = Math.max(0, Math.min(newTop, trackHeight - thumb));

      const proportion = newTop / (trackHeight - thumb);
      const scrollPosition = proportion * (table.scrollHeight - table.clientHeight);

      table.scrollTop = scrollPosition;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleScrollbarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableContainerRef.current || !scrollbarTrackRef.current) return;

    const track = scrollbarTrackRef.current;
    const table = tableContainerRef.current;
    const clickY = e.clientY - track.getBoundingClientRect().top;

    const thumb = Math.max(
      (table.clientHeight / table.scrollHeight) * (table.clientHeight - 24),
      40,
    );
    const trackHeight = track.clientHeight;

    let newTop = clickY - thumb / 2;
    newTop = Math.max(0, Math.min(newTop, trackHeight - thumb));

    const proportion = newTop / (trackHeight - thumb);
    const scrollPosition = proportion * (table.scrollHeight - table.clientHeight);

    table.scrollTop = scrollPosition;
  };

  const selectedFormData = selectedItem
    ? {
        sku: selectedItem.sku,
        name: selectedItem.name,
        image: selectedItem.image,
        purchasePrice: selectedItem.purchasePrice,
        sellingPrice: selectedItem.sellingPrice,
        stock: selectedItem.stock,
        category: selectedItem.category as InventoryFormData["category"],
        supplier: selectedItem.supplier || "",
        description: selectedItem.description || "",
      }
    : undefined;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Header with responsive layout */}
      <div className="flex-shrink-0 px-6 pt-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-bold text-[#102e3c] text-2xl sm:text-3xl lg:text-4xl tracking-[-0.75px] leading-tight">
            Tồn Kho
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-shrink-0">
              <SorterButton onSortChange={handleSortChange} currentSort={sortBy} currentSortOrder={sortOrder} />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <ActionButton label="Xóa" variant="outlined" onClick={handleDeleteClick} />
              <ActionButton label="Sửa" variant="outlined" onClick={handleEditClick} />
              <ActionButton
                label="Tạo Mới"
                variant="filled"
                onClick={() => {
                  setAddPanelCategory(selectedCategory);
                  setIsAddPanelOpen(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* Category Toggle Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => {
              setSelectedCategory("Văn phòng phẩm");
              setSelectedItem(null);
            }}
            className={`px-6 py-2 rounded-lg font-semibold text-base transition-all ${
              selectedCategory === "Văn phòng phẩm"
                ? "bg-[#1a998f] text-white border-2 border-[#1a998f]"
                : "bg-white text-[#102e3c] border-2 border-[#102e3c] hover:border-[#1a998f]"
            }`}
          >
            Văn Phòng Phẩm
          </button>
          <button
            onClick={() => {
              setSelectedCategory("Sách");
              setSelectedItem(null);
            }}
            className={`px-6 py-2 rounded-lg font-semibold text-base transition-all ${
              selectedCategory === "Sách"
                ? "bg-[#1a998f] text-white border-2 border-[#1a998f]"
                : "bg-white text-[#102e3c] border-2 border-[#102e3c] hover:border-[#1a998f]"
            }`}
          >
            Sách
          </button>
        </div>
      </div>

      <main className="flex-1 px-6 pb-6 overflow-hidden">
        <section className="relative w-full h-full bg-white rounded-[20px] overflow-hidden border border-solid border-[#102e3c] shadow-[0px_1px_2px_#0000000d]">
          {needsScroll && (
            <div
              ref={scrollbarTrackRef}
              className={`absolute top-[72px] bottom-3 w-[15px] bg-[#d4e5e4] rounded-[999px] cursor-pointer transition-all duration-300 ${
                selectedItem ? "right-[480px]" : "right-[20px]"
              }`}
              role="scrollbar"
              aria-orientation="vertical"
              aria-valuemin={0}
              aria-valuemax={100}
              onClick={handleScrollbarClick}
            >
              <div
                className={`w-[15px] bg-[#102e3c] rounded-[999px] hover:bg-[#1a998f] transition-colors cursor-grab active:cursor-grabbing ${
                  isDragging ? "bg-[#1a998f]" : ""
                }`}
                style={{
                  height: `${thumbHeight || 40}px`,
                  transform: `translateY(${tableContainerRef.current ?
                    (scrollTop /
                      (tableContainerRef.current.scrollHeight -
                        tableContainerRef.current.clientHeight)) *
                    (tableContainerRef.current.clientHeight -
                      24 -
                      (thumbHeight || 40))
                    : 0}px)`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
                onMouseDown={handleThumbMouseDown}
              />
            </div>
          )}

          <button
            type="button"
            aria-label="Toggle detail panel"
            className={`absolute top-[15px] w-12 h-12 cursor-pointer hover:opacity-70 transition-all duration-300 outline-none border-none focus:outline-none focus:ring-0 active:outline-none ${selectedItem ? "right-[462px] rotate-90" : "right-[2px] rotate-0"}`}
            onClick={() => {
              if (selectedItem) {
                setSelectedItem(null);
              } else if (data.length > 0) {
                setSelectedItem(data[0]);
              }
            }}
          >
            <svg className="w-full h-full" viewBox="0 0 48 48" fill="none">
              <path d="M31 10H22L32 24L22 38H31L41 24L31 10Z" fill="#102E3C" />
              <path d="M17 10H8L18 24L8 38H17L27 24L17 10Z" fill="#102E3C" />
            </svg>
          </button>

          {/* Table Wrapper + body */}
          <div
            className={`absolute top-3 bottom-3 left-[13px] rounded-[20px] transition-all duration-300 flex flex-col ${
              selectedItem ? "right-[525px]" : "right-[65px]"
            }`}
          >
            <div className="flex-shrink-0">
              <TableHeader />
            </div>

            <div
              ref={tableContainerRef}
              className="flex flex-col items-start overflow-y-auto flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onScroll={handleTableScroll}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <InventoryTable
                data={data.filter((item) => item.category === selectedCategory)}
                loading={loading}
                selectedItem={selectedItem}
                onRowClick={handleRowClick}
              />
            </div>
          </div>

          <InventoryDetailPanel selectedItem={selectedItem} />
        </section>
      </main>

      <InventoryAddPanel
        isOpen={isAddPanelOpen}
        category={addPanelCategory}
        onClose={() => {
          setIsAddPanelOpen(false);
          setAddPanelCategory(null);
        }}
        onSubmit={handleAddItem}
      />

      <InventoryEditPanel
        isOpen={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        onSubmit={handleEditItem}
        initialData={selectedFormData}
      />
    </div>
  );
};
